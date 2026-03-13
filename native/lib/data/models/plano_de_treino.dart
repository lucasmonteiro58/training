import 'package:isar/isar.dart';

part 'plano_de_treino.g.dart';

@collection
class PlanoDeTreino {
  Id id = Isar.autoIncrement;

  late String nome;

  String? descricao;

  /// Cor principal do plano em ARGB.
  int? cor;

  late DateTime criadoEm;

  DateTime? atualizadoEm;

  bool arquivado = false;

  /// Ordem na lista (menor = primeiro). Usado para reordenar.
  int ordem = 0;
}

