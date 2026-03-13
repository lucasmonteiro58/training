import 'serie_registrada.dart';

/// Exercício dentro de uma sessão de treino (com séries realizadas).
class ExercicioNaSessao {
  ExercicioNaSessao({
    required this.exercicioId,
    required this.exercicioNome,
    this.gifUrl,
    required this.grupoMuscular,
    required this.series,
    this.descansoSegundos = 90,
    required this.ordem,
    this.notas,
    this.instrucoes,
    this.tipoSerie,
    this.duracaoMetaSegundos,
    this.agrupamentoId,
    this.tipoAgrupamento,
  });

  final String exercicioId;
  final String exercicioNome;
  final String? gifUrl;
  final String grupoMuscular;
  final List<SerieRegistrada> series;
  final int descansoSegundos;
  final int ordem;
  final String? notas;
  final List<String>? instrucoes;
  final String? tipoSerie;
  final int? duracaoMetaSegundos;
  final String? agrupamentoId;
  final String? tipoAgrupamento;

  Map<String, dynamic> toJson() => {
        'exercicioId': exercicioId,
        'exercicioNome': exercicioNome,
        if (gifUrl != null) 'gifUrl': gifUrl,
        'grupoMuscular': grupoMuscular,
        'series': series.map((e) => e.toJson()).toList(),
        'descansoSegundos': descansoSegundos,
        'ordem': ordem,
        if (notas != null) 'notas': notas,
        if (instrucoes != null) 'instrucoes': instrucoes,
        if (tipoSerie != null) 'tipoSerie': tipoSerie,
        if (duracaoMetaSegundos != null) 'duracaoMetaSegundos': duracaoMetaSegundos,
        if (agrupamentoId != null) 'agrupamentoId': agrupamentoId,
        if (tipoAgrupamento != null) 'tipoAgrupamento': tipoAgrupamento,
      };

  factory ExercicioNaSessao.fromJson(Map<String, dynamic> json) {
    final seriesList = json['series'] as List;
    return ExercicioNaSessao(
      exercicioId: json['exercicioId'] as String,
      exercicioNome: json['exercicioNome'] as String,
      gifUrl: json['gifUrl'] as String?,
      grupoMuscular: json['grupoMuscular'] as String,
      series: seriesList
          .map((e) => SerieRegistrada.fromJson(e as Map<String, dynamic>))
          .toList(),
      descansoSegundos: json['descansoSegundos'] as int? ?? 90,
      ordem: json['ordem'] as int,
      notas: json['notas'] as String?,
      instrucoes: (json['instrucoes'] as List?)?.cast<String>(),
      tipoSerie: json['tipoSerie'] as String?,
      duracaoMetaSegundos: json['duracaoMetaSegundos'] as int?,
      agrupamentoId: json['agrupamentoId'] as String?,
      tipoAgrupamento: json['tipoAgrupamento'] as String?,
    );
  }
}
