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

  Future<void> criarPlanoSimples({required String nome}) async {
    final isar = await _isar;
    final plano = PlanoDeTreino()
      ..nome = nome
      ..criadoEm = DateTime.now()
      ..arquivado = false;

    await isar.writeTxn(() async {
      await isar.planoDeTreinos.put(plano);
    });
  }
}

