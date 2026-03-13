import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:isar/isar.dart';

import '../local/isar/isar_provider.dart';
import '../models/exercicio.dart';
import '../models/exercicio_no_plano_entity.dart';
import '../remote/exercicios_remote_client.dart';

final exerciciosRepositoryProvider = Provider<ExerciciosRepository>(
  (ref) => ExerciciosRepository(ref),
);

/// Stream de exercícios de um plano (para usar na tela de detalhe).
final exerciciosDoPlanoProvider = StreamProvider.autoDispose
    .family<List<ExercicioNoPlanoEntity>, int>((ref, planoId) {
  return ref.read(exerciciosRepositoryProvider).watchExerciciosDoPlano(planoId);
});

class ExerciciosRepository {
  ExerciciosRepository(this._ref);

  final Ref _ref;

  Future<Isar> get _isar async => _ref.read(isarProvider.future);

  // --- Catálogo de exercícios ---

  Future<List<Exercicio>> getAll() async {
    final isar = await _isar;
    return isar.exercicios.where().findAll();
  }

  Stream<List<Exercicio>> watchAll() async* {
    final isar = await _isar;
    yield* isar.exercicios.where().watch(fireImmediately: true);
  }

  Future<List<Exercicio>> search(String query) async {
    if (query.trim().isEmpty) return getAll();
    final isar = await _isar;
    final q = query.trim().toLowerCase();
    final all = await isar.exercicios.where().findAll();
    return all.where((e) => e.nome.toLowerCase().contains(q)).toList();
  }

  Future<List<Exercicio>> filterByGrupo(String? grupo) async {
    final isar = await _isar;
    if (grupo == null || grupo.isEmpty) return isar.exercicios.where().findAll();
    return isar.exercicios.filter().grupoMuscularEqualTo(grupo).findAll();
  }

  Future<Exercicio?> getById(int id) async {
    final isar = await _isar;
    return isar.exercicios.get(id);
  }

  Future<int> insertExercicio(Exercicio e) async {
    final isar = await _isar;
    await isar.writeTxn(() async {
      await isar.exercicios.put(e);
    });
    return e.id;
  }

  Future<void> updateExercicio(Exercicio e) async {
    final isar = await _isar;
    await isar.writeTxn(() async {
      await isar.exercicios.put(e);
    });
  }

  Future<void> deleteExercicio(int id) async {
    final isar = await _isar;
    await isar.writeTxn(() async {
      await isar.exercicios.delete(id);
    });
  }

  /// Sincroniza o catálogo com a base remota e persiste em cache local.
  /// Em caso de falha (offline), não altera o cache (fallback offline).
  /// Retorna true se conseguiu baixar e salvar, false se usou apenas cache.
  Future<bool> syncFromRemote() async {
    final remotos = await fetchExerciciosRemotos();
    if (remotos.isEmpty) return false;
    final isar = await _isar;
    await isar.writeTxn(() async {
      for (final ex in remotos) {
        if (ex.externalId == null) continue;
        final existente = await isar.exercicios
            .filter()
            .externalIdEqualTo(ex.externalId!)
            .findFirst();
        if (existente != null) {
          existente.nome = ex.nome;
          existente.grupoMuscular = ex.grupoMuscular;
          existente.equipamento = ex.equipamento;
          existente.instrucoes = ex.instrucoes;
          existente.imageUrl = ex.imageUrl;
          await isar.exercicios.put(existente);
        } else {
          await isar.exercicios.put(ex);
        }
      }
    });
    return true;
  }

  /// Garante que existam exercícios no catálogo (seed local se vazio após sync).
  Future<void> seedSeVazio() async {
    final isar = await _isar;
    final count = await isar.exercicios.count();
    if (count > 0) return;
    await syncFromRemote();
    final countAfter = await isar.exercicios.count();
    if (countAfter > 0) return;
    await isar.writeTxn(() async {
      for (final nome in [
        'Supino reto',
        'Agachamento livre',
        'Remada curvada',
        'Desenvolvimento',
        'Rosca direta',
        'Tríceps testa',
        'Leg press',
        'Stiff',
      ]) {
        final e = Exercicio()
          ..nome = nome
          ..grupoMuscular = 'Outro'
          ..isCustom = true;
        await isar.exercicios.put(e);
      }
    });
  }

  // --- Exercícios no plano ---

  Future<List<ExercicioNoPlanoEntity>> getExerciciosDoPlano(int planoId) async {
    final isar = await _isar;
    return isar.exercicioNoPlanoEntitys
        .filter()
        .planoIdEqualTo(planoId)
        .sortByOrdem()
        .findAll();
  }

  Stream<List<ExercicioNoPlanoEntity>> watchExerciciosDoPlano(int planoId) async* {
    final isar = await _isar;
    yield* isar.exercicioNoPlanoEntitys
        .filter()
        .planoIdEqualTo(planoId)
        .sortByOrdem()
        .watch(fireImmediately: true);
  }

  Future<void> addExercicioAoPlano({
    required int planoId,
    required String exercicioId,
    required String exercicioNome,
    int series = 3,
    int repeticoesMeta = 10,
    double? pesoMeta,
    int descansoSegundos = 90,
  }) async {
    final isar = await _isar;
    final existentes = await getExerciciosDoPlano(planoId);
    final proximaOrdem = existentes.isEmpty ? 0 : (existentes.last.ordem + 1);
    final ent = ExercicioNoPlanoEntity()
      ..planoId = planoId
      ..exercicioId = exercicioId
      ..exercicioNome = exercicioNome
      ..ordem = proximaOrdem
      ..series = series
      ..repeticoesMeta = repeticoesMeta
      ..pesoMeta = pesoMeta
      ..descansoSegundos = descansoSegundos;
    await isar.writeTxn(() async {
      await isar.exercicioNoPlanoEntitys.put(ent);
    });
  }

  Future<void> removeExercicioDoPlano(int idEntidade) async {
    final isar = await _isar;
    await isar.writeTxn(() async {
      await isar.exercicioNoPlanoEntitys.delete(idEntidade);
    });
  }

  Future<void> updateExercicioNoPlano(ExercicioNoPlanoEntity ent) async {
    final isar = await _isar;
    await isar.writeTxn(() async {
      await isar.exercicioNoPlanoEntitys.put(ent);
    });
  }

  Future<void> reordenarExerciciosNoPlano(int planoId, List<int> idsEmOrdem) async {
    final isar = await _isar;
    await isar.writeTxn(() async {
      for (var i = 0; i < idsEmOrdem.length; i++) {
        final ent = await isar.exercicioNoPlanoEntitys.get(idsEmOrdem[i]);
        if (ent != null) {
          ent.ordem = i;
          await isar.exercicioNoPlanoEntitys.put(ent);
        }
      }
    });
  }
}
