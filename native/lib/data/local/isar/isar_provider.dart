import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';

import '../../models/exercicio.dart';
import '../../models/exercicio_no_plano_entity.dart';
import '../../models/plano_de_treino.dart';

final isarProvider = FutureProvider<Isar>(
  (ref) async {
    if (Isar.instanceNames.isNotEmpty) {
      return Isar.getInstance()!;
    }

    final dir = await getApplicationSupportDirectory();

    return Isar.open(
      [PlanoDeTreinoSchema, ExercicioSchema, ExercicioNoPlanoEntitySchema],
      inspector: true,
      directory: dir.path,
      name: 'training_native',
    );
  },
);

