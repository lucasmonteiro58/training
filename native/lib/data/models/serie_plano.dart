/// Uma série no plano (meta de peso e repetições).
class SeriePlano {
  SeriePlano({
    required this.peso,
    required this.repeticoes,
  });

  final double peso;
  final int repeticoes;

  Map<String, dynamic> toJson() => {
        'peso': peso,
        'repeticoes': repeticoes,
      };

  factory SeriePlano.fromJson(Map<String, dynamic> json) => SeriePlano(
        peso: (json['peso'] as num).toDouble(),
        repeticoes: json['repeticoes'] as int,
      );

  SeriePlano copyWith({double? peso, int? repeticoes}) => SeriePlano(
        peso: peso ?? this.peso,
        repeticoes: repeticoes ?? this.repeticoes,
      );
}
