/// Uma série registrada durante/após o treino.
class SerieRegistrada {
  SerieRegistrada({
    required this.id,
    required this.ordem,
    required this.repeticoes,
    required this.peso,
    required this.completada,
    this.duracaoSegundos,
    this.rpe,
    this.notas,
  });

  final String id;
  final int ordem;
  final int repeticoes;
  final double peso;
  final bool completada;
  final int? duracaoSegundos;
  final int? rpe;
  final String? notas;

  Map<String, dynamic> toJson() => {
        'id': id,
        'ordem': ordem,
        'repeticoes': repeticoes,
        'peso': peso,
        'completada': completada,
        if (duracaoSegundos != null) 'duracaoSegundos': duracaoSegundos,
        if (rpe != null) 'rpe': rpe,
        if (notas != null) 'notas': notas,
      };

  factory SerieRegistrada.fromJson(Map<String, dynamic> json) => SerieRegistrada(
        id: json['id'] as String,
        ordem: json['ordem'] as int,
        repeticoes: json['repeticoes'] as int,
        peso: (json['peso'] as num).toDouble(),
        completada: json['completada'] as bool,
        duracaoSegundos: json['duracaoSegundos'] as int?,
        rpe: json['rpe'] as int?,
        notas: json['notas'] as String?,
      );

  SerieRegistrada copyWith({
    String? id,
    int? ordem,
    int? repeticoes,
    double? peso,
    bool? completada,
    int? duracaoSegundos,
    int? rpe,
    String? notas,
  }) =>
      SerieRegistrada(
        id: id ?? this.id,
        ordem: ordem ?? this.ordem,
        repeticoes: repeticoes ?? this.repeticoes,
        peso: peso ?? this.peso,
        completada: completada ?? this.completada,
        duracaoSegundos: duracaoSegundos ?? this.duracaoSegundos,
        rpe: rpe ?? this.rpe,
        notas: notas ?? this.notas,
      );
}
