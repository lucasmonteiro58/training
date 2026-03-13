import 'serie_plano.dart';

/// Tipo de série: reps, tempo ou falha.
enum TipoSerie {
  reps,
  tempo,
  falha,
}

/// Exercício dentro de um plano (referência ao exercício + séries meta).
class ExercicioNoPlano {
  ExercicioNoPlano({
    required this.id,
    required this.exercicioId,
    required this.series,
    required this.repeticoesMeta,
    this.pesoMeta,
    this.seriesDetalhadas,
    this.descansoSegundos = 90,
    required this.ordem,
    this.notas,
    this.tipoSerie = TipoSerie.reps,
    this.duracaoMetaSegundos,
    this.agrupamentoId,
    this.tipoAgrupamento,
  });

  final String id;
  final String exercicioId;
  final int series;
  final int repeticoesMeta;
  final double? pesoMeta;
  final List<SeriePlano>? seriesDetalhadas;
  final int descansoSegundos;
  final int ordem;
  final String? notas;
  final TipoSerie tipoSerie;
  final int? duracaoMetaSegundos;
  final String? agrupamentoId;
  final String? tipoAgrupamento;

  Map<String, dynamic> toJson() => {
        'id': id,
        'exercicioId': exercicioId,
        'series': series,
        'repeticoesMeta': repeticoesMeta,
        if (pesoMeta != null) 'pesoMeta': pesoMeta,
        if (seriesDetalhadas != null)
          'seriesDetalhadas': seriesDetalhadas!.map((e) => e.toJson()).toList(),
        'descansoSegundos': descansoSegundos,
        'ordem': ordem,
        if (notas != null) 'notas': notas,
        'tipoSerie': tipoSerie.name,
        if (duracaoMetaSegundos != null) 'duracaoMetaSegundos': duracaoMetaSegundos,
        if (agrupamentoId != null) 'agrupamentoId': agrupamentoId,
        if (tipoAgrupamento != null) 'tipoAgrupamento': tipoAgrupamento,
      };

  factory ExercicioNoPlano.fromJson(Map<String, dynamic> json) {
    List<SeriePlano>? seriesDetalhadas;
    if (json['seriesDetalhadas'] != null) {
      seriesDetalhadas = (json['seriesDetalhadas'] as List)
          .map((e) => SeriePlano.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    return ExercicioNoPlano(
      id: json['id'] as String,
      exercicioId: json['exercicioId'] as String,
      series: json['series'] as int,
      repeticoesMeta: json['repeticoesMeta'] as int,
      pesoMeta: (json['pesoMeta'] as num?)?.toDouble(),
      seriesDetalhadas: seriesDetalhadas,
      descansoSegundos: json['descansoSegundos'] as int? ?? 90,
      ordem: json['ordem'] as int,
      notas: json['notas'] as String?,
      tipoSerie: _parseTipoSerie(json['tipoSerie'] as String?),
      duracaoMetaSegundos: json['duracaoMetaSegundos'] as int?,
      agrupamentoId: json['agrupamentoId'] as String?,
      tipoAgrupamento: json['tipoAgrupamento'] as String?,
    );
  }

  static TipoSerie _parseTipoSerie(String? v) {
    if (v == null) return TipoSerie.reps;
    switch (v) {
      case 'tempo':
        return TipoSerie.tempo;
      case 'falha':
        return TipoSerie.falha;
      default:
        return TipoSerie.reps;
    }
  }
}
