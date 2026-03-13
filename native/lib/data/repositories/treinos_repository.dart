import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:isar/isar.dart';

import '../local/isar/isar_provider.dart';
import '../models/plano_de_treino.dart';

final treinosRepositoryProvider = Provider<TreinosRepository>(
  (ref) => TreinosRepository(ref),
);

class TreinosRepository {
  TreinosRepository(this._ref);

  final Ref _ref;

  Future<Isar> get _isar async => _ref.read(isarProvider.future);

  Stream<List<PlanoDeTreino>> watchPlanos() async* {
    final isar = await _isar;
    yield* isar.planoDeTreinos
        .filter()
        .arquivadoEqualTo(false)
        .sortByCriadoEmDesc()
        .watch(fireImmediately: true);
  }

  Stream<List<PlanoDeTreino>> watchPlanosArquivados() async* {
    final isar = await _isar;
    yield* isar.planoDeTreinos
        .filter()
        .arquivadoEqualTo(true)
        .sortByCriadoEmDesc()
        .watch(fireImmediately: true);
  }

  Future<PlanoDeTreino?> getById(int id) async {
    final isar = await _isar;
    return isar.planoDeTreinos.get(id);
  }

  Future<void> criarPlano({
    required String nome,
    String? descricao,
    int? cor,
  }) async {
    final isar = await _isar;
    final plano = PlanoDeTreino()
      ..nome = nome
      ..descricao = descricao
      ..cor = cor
      ..criadoEm = DateTime.now()
      ..atualizadoEm = DateTime.now()
      ..arquivado = false;

    await isar.writeTxn(() async {
      await isar.planoDeTreinos.put(plano);
    });
  }

  Future<void> criarPlanoSimples({required String nome}) async {
    await criarPlano(nome: nome);
  }

  Future<void> atualizar(int id, {String? nome, String? descricao, int? cor}) async {
    final isar = await _isar;
    final plano = await isar.planoDeTreinos.get(id);
    if (plano == null) return;

    if (nome != null) plano.nome = nome;
    if (descricao != null) plano.descricao = descricao;
    if (cor != null) plano.cor = cor;
    plano.atualizadoEm = DateTime.now();

    await isar.writeTxn(() async {
      await isar.planoDeTreinos.put(plano);
    });
  }

  Future<void> arquivar(int id) async {
    final isar = await _isar;
    final plano = await isar.planoDeTreinos.get(id);
    if (plano == null) return;
    plano.arquivado = true;
    plano.atualizadoEm = DateTime.now();
    await isar.writeTxn(() async {
      await isar.planoDeTreinos.put(plano);
    });
  }

  Future<void> desarquivar(int id) async {
    final isar = await _isar;
    final plano = await isar.planoDeTreinos.get(id);
    if (plano == null) return;
    plano.arquivado = false;
    plano.atualizadoEm = DateTime.now();
    await isar.writeTxn(() async {
      await isar.planoDeTreinos.put(plano);
    });
  }

  Future<void> excluir(int id) async {
    final isar = await _isar;
    await isar.writeTxn(() async {
      await isar.planoDeTreinos.delete(id);
    });
  }

  Future<void> duplicar(int id) async {
    final isar = await _isar;
    final original = await isar.planoDeTreinos.get(id);
    if (original == null) return;

    final copia = PlanoDeTreino()
      ..nome = '${original.nome} (cópia)'
      ..descricao = original.descricao
      ..cor = original.cor
      ..criadoEm = DateTime.now()
      ..atualizadoEm = DateTime.now()
      ..arquivado = false;

    await isar.writeTxn(() async {
      await isar.planoDeTreinos.put(copia);
    });
  }
}
