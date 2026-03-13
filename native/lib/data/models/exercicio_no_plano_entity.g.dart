// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'exercicio_no_plano_entity.dart';

// **************************************************************************
// IsarCollectionGenerator
// **************************************************************************

// coverage:ignore-file
// ignore_for_file: duplicate_ignore, non_constant_identifier_names, constant_identifier_names, invalid_use_of_protected_member, unnecessary_cast, prefer_const_constructors, lines_longer_than_80_chars, require_trailing_commas, inference_failure_on_function_invocation, unnecessary_parenthesis, unnecessary_raw_strings, unnecessary_null_checks, join_return_with_assignment, prefer_final_locals, avoid_js_rounded_ints, avoid_positional_boolean_parameters, always_specify_types

extension GetExercicioNoPlanoEntityCollection on Isar {
  IsarCollection<ExercicioNoPlanoEntity> get exercicioNoPlanoEntitys =>
      this.collection();
}

// ID reduzido para caber em JS safe integer (web).
const ExercicioNoPlanoEntitySchema = CollectionSchema(
  name: r'ExercicioNoPlanoEntity',
  id: 3,
  properties: {
    r'descansoSegundos': PropertySchema(
      id: 0,
      name: r'descansoSegundos',
      type: IsarType.long,
    ),
    r'duracaoMetaSegundos': PropertySchema(
      id: 1,
      name: r'duracaoMetaSegundos',
      type: IsarType.long,
    ),
    r'exercicioId': PropertySchema(
      id: 2,
      name: r'exercicioId',
      type: IsarType.string,
    ),
    r'exercicioNome': PropertySchema(
      id: 3,
      name: r'exercicioNome',
      type: IsarType.string,
    ),
    r'notas': PropertySchema(
      id: 4,
      name: r'notas',
      type: IsarType.string,
    ),
    r'ordem': PropertySchema(
      id: 5,
      name: r'ordem',
      type: IsarType.long,
    ),
    r'pesoMeta': PropertySchema(
      id: 6,
      name: r'pesoMeta',
      type: IsarType.double,
    ),
    r'planoId': PropertySchema(
      id: 7,
      name: r'planoId',
      type: IsarType.long,
    ),
    r'repeticoesMeta': PropertySchema(
      id: 8,
      name: r'repeticoesMeta',
      type: IsarType.long,
    ),
    r'series': PropertySchema(
      id: 9,
      name: r'series',
      type: IsarType.long,
    ),
    r'tipoSerie': PropertySchema(
      id: 10,
      name: r'tipoSerie',
      type: IsarType.long,
    )
  },
  estimateSize: _exercicioNoPlanoEntityEstimateSize,
  serialize: _exercicioNoPlanoEntitySerialize,
  deserialize: _exercicioNoPlanoEntityDeserialize,
  deserializeProp: _exercicioNoPlanoEntityDeserializeProp,
  idName: r'id',
  indexes: {},
  links: {},
  embeddedSchemas: {},
  getId: _exercicioNoPlanoEntityGetId,
  getLinks: _exercicioNoPlanoEntityGetLinks,
  attach: _exercicioNoPlanoEntityAttach,
  version: '3.1.0+1',
);

int _exercicioNoPlanoEntityEstimateSize(
  ExercicioNoPlanoEntity object,
  List<int> offsets,
  Map<Type, List<int>> allOffsets,
) {
  var bytesCount = offsets.last;
  bytesCount += 3 + object.exercicioId.length * 3;
  {
    final value = object.exercicioNome;
    if (value != null) {
      bytesCount += 3 + value.length * 3;
    }
  }
  {
    final value = object.notas;
    if (value != null) {
      bytesCount += 3 + value.length * 3;
    }
  }
  return bytesCount;
}

void _exercicioNoPlanoEntitySerialize(
  ExercicioNoPlanoEntity object,
  IsarWriter writer,
  List<int> offsets,
  Map<Type, List<int>> allOffsets,
) {
  writer.writeLong(offsets[0], object.descansoSegundos);
  writer.writeLong(offsets[1], object.duracaoMetaSegundos);
  writer.writeString(offsets[2], object.exercicioId);
  writer.writeString(offsets[3], object.exercicioNome);
  writer.writeString(offsets[4], object.notas);
  writer.writeLong(offsets[5], object.ordem);
  writer.writeDouble(offsets[6], object.pesoMeta);
  writer.writeLong(offsets[7], object.planoId);
  writer.writeLong(offsets[8], object.repeticoesMeta);
  writer.writeLong(offsets[9], object.series);
  writer.writeLong(offsets[10], object.tipoSerie);
}

ExercicioNoPlanoEntity _exercicioNoPlanoEntityDeserialize(
  Id id,
  IsarReader reader,
  List<int> offsets,
  Map<Type, List<int>> allOffsets,
) {
  final object = ExercicioNoPlanoEntity();
  object.descansoSegundos = reader.readLong(offsets[0]);
  object.duracaoMetaSegundos = reader.readLongOrNull(offsets[1]);
  object.exercicioId = reader.readString(offsets[2]);
  object.exercicioNome = reader.readStringOrNull(offsets[3]);
  object.id = id;
  object.notas = reader.readStringOrNull(offsets[4]);
  object.ordem = reader.readLong(offsets[5]);
  object.pesoMeta = reader.readDoubleOrNull(offsets[6]);
  object.planoId = reader.readLong(offsets[7]);
  object.repeticoesMeta = reader.readLong(offsets[8]);
  object.series = reader.readLong(offsets[9]);
  object.tipoSerie = reader.readLong(offsets[10]);
  return object;
}

P _exercicioNoPlanoEntityDeserializeProp<P>(
  IsarReader reader,
  int propertyId,
  int offset,
  Map<Type, List<int>> allOffsets,
) {
  switch (propertyId) {
    case 0:
      return (reader.readLong(offset)) as P;
    case 1:
      return (reader.readLongOrNull(offset)) as P;
    case 2:
      return (reader.readString(offset)) as P;
    case 3:
      return (reader.readStringOrNull(offset)) as P;
    case 4:
      return (reader.readStringOrNull(offset)) as P;
    case 5:
      return (reader.readLong(offset)) as P;
    case 6:
      return (reader.readDoubleOrNull(offset)) as P;
    case 7:
      return (reader.readLong(offset)) as P;
    case 8:
      return (reader.readLong(offset)) as P;
    case 9:
      return (reader.readLong(offset)) as P;
    case 10:
      return (reader.readLong(offset)) as P;
    default:
      throw IsarError('Unknown property with id $propertyId');
  }
}

Id _exercicioNoPlanoEntityGetId(ExercicioNoPlanoEntity object) {
  return object.id;
}

List<IsarLinkBase<dynamic>> _exercicioNoPlanoEntityGetLinks(
    ExercicioNoPlanoEntity object) {
  return [];
}

void _exercicioNoPlanoEntityAttach(
    IsarCollection<dynamic> col, Id id, ExercicioNoPlanoEntity object) {
  object.id = id;
}

extension ExercicioNoPlanoEntityQueryWhereSort
    on QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QWhere> {
  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterWhere>
      anyId() {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(const IdWhereClause.any());
    });
  }
}

extension ExercicioNoPlanoEntityQueryWhere on QueryBuilder<
    ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QWhereClause> {
  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterWhereClause> idEqualTo(Id id) {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(IdWhereClause.between(
        lower: id,
        upper: id,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterWhereClause> idNotEqualTo(Id id) {
    return QueryBuilder.apply(this, (query) {
      if (query.whereSort == Sort.asc) {
        return query
            .addWhereClause(
              IdWhereClause.lessThan(upper: id, includeUpper: false),
            )
            .addWhereClause(
              IdWhereClause.greaterThan(lower: id, includeLower: false),
            );
      } else {
        return query
            .addWhereClause(
              IdWhereClause.greaterThan(lower: id, includeLower: false),
            )
            .addWhereClause(
              IdWhereClause.lessThan(upper: id, includeUpper: false),
            );
      }
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterWhereClause> idGreaterThan(Id id, {bool include = false}) {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(
        IdWhereClause.greaterThan(lower: id, includeLower: include),
      );
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterWhereClause> idLessThan(Id id, {bool include = false}) {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(
        IdWhereClause.lessThan(upper: id, includeUpper: include),
      );
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterWhereClause> idBetween(
    Id lowerId,
    Id upperId, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(IdWhereClause.between(
        lower: lowerId,
        includeLower: includeLower,
        upper: upperId,
        includeUpper: includeUpper,
      ));
    });
  }
}

extension ExercicioNoPlanoEntityQueryFilter on QueryBuilder<
    ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QFilterCondition> {
  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> descansoSegundosEqualTo(int value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'descansoSegundos',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> descansoSegundosGreaterThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'descansoSegundos',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> descansoSegundosLessThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'descansoSegundos',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> descansoSegundosBetween(
    int lower,
    int upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'descansoSegundos',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> duracaoMetaSegundosIsNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNull(
        property: r'duracaoMetaSegundos',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> duracaoMetaSegundosIsNotNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNotNull(
        property: r'duracaoMetaSegundos',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> duracaoMetaSegundosEqualTo(int? value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'duracaoMetaSegundos',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> duracaoMetaSegundosGreaterThan(
    int? value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'duracaoMetaSegundos',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> duracaoMetaSegundosLessThan(
    int? value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'duracaoMetaSegundos',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> duracaoMetaSegundosBetween(
    int? lower,
    int? upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'duracaoMetaSegundos',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdEqualTo(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'exercicioId',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdGreaterThan(
    String value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'exercicioId',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdLessThan(
    String value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'exercicioId',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdBetween(
    String lower,
    String upper, {
    bool includeLower = true,
    bool includeUpper = true,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'exercicioId',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdStartsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.startsWith(
        property: r'exercicioId',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdEndsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.endsWith(
        property: r'exercicioId',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
          QAfterFilterCondition>
      exercicioIdContains(String value, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.contains(
        property: r'exercicioId',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
          QAfterFilterCondition>
      exercicioIdMatches(String pattern, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.matches(
        property: r'exercicioId',
        wildcard: pattern,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdIsEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'exercicioId',
        value: '',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioIdIsNotEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        property: r'exercicioId',
        value: '',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeIsNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNull(
        property: r'exercicioNome',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeIsNotNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNotNull(
        property: r'exercicioNome',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeEqualTo(
    String? value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'exercicioNome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeGreaterThan(
    String? value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'exercicioNome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeLessThan(
    String? value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'exercicioNome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeBetween(
    String? lower,
    String? upper, {
    bool includeLower = true,
    bool includeUpper = true,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'exercicioNome',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeStartsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.startsWith(
        property: r'exercicioNome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeEndsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.endsWith(
        property: r'exercicioNome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
          QAfterFilterCondition>
      exercicioNomeContains(String value, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.contains(
        property: r'exercicioNome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
          QAfterFilterCondition>
      exercicioNomeMatches(String pattern, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.matches(
        property: r'exercicioNome',
        wildcard: pattern,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeIsEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'exercicioNome',
        value: '',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> exercicioNomeIsNotEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        property: r'exercicioNome',
        value: '',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> idEqualTo(Id value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'id',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> idGreaterThan(
    Id value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'id',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> idLessThan(
    Id value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'id',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> idBetween(
    Id lower,
    Id upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'id',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasIsNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNull(
        property: r'notas',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasIsNotNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNotNull(
        property: r'notas',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasEqualTo(
    String? value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'notas',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasGreaterThan(
    String? value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'notas',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasLessThan(
    String? value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'notas',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasBetween(
    String? lower,
    String? upper, {
    bool includeLower = true,
    bool includeUpper = true,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'notas',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasStartsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.startsWith(
        property: r'notas',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasEndsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.endsWith(
        property: r'notas',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
          QAfterFilterCondition>
      notasContains(String value, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.contains(
        property: r'notas',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
          QAfterFilterCondition>
      notasMatches(String pattern, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.matches(
        property: r'notas',
        wildcard: pattern,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasIsEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'notas',
        value: '',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> notasIsNotEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        property: r'notas',
        value: '',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> ordemEqualTo(int value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'ordem',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> ordemGreaterThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'ordem',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> ordemLessThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'ordem',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> ordemBetween(
    int lower,
    int upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'ordem',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> pesoMetaIsNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNull(
        property: r'pesoMeta',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> pesoMetaIsNotNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNotNull(
        property: r'pesoMeta',
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> pesoMetaEqualTo(
    double? value, {
    double epsilon = Query.epsilon,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'pesoMeta',
        value: value,
        epsilon: epsilon,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> pesoMetaGreaterThan(
    double? value, {
    bool include = false,
    double epsilon = Query.epsilon,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'pesoMeta',
        value: value,
        epsilon: epsilon,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> pesoMetaLessThan(
    double? value, {
    bool include = false,
    double epsilon = Query.epsilon,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'pesoMeta',
        value: value,
        epsilon: epsilon,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> pesoMetaBetween(
    double? lower,
    double? upper, {
    bool includeLower = true,
    bool includeUpper = true,
    double epsilon = Query.epsilon,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'pesoMeta',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
        epsilon: epsilon,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> planoIdEqualTo(int value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'planoId',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> planoIdGreaterThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'planoId',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> planoIdLessThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'planoId',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> planoIdBetween(
    int lower,
    int upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'planoId',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> repeticoesMetaEqualTo(int value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'repeticoesMeta',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> repeticoesMetaGreaterThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'repeticoesMeta',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> repeticoesMetaLessThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'repeticoesMeta',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> repeticoesMetaBetween(
    int lower,
    int upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'repeticoesMeta',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> seriesEqualTo(int value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'series',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> seriesGreaterThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'series',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> seriesLessThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'series',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> seriesBetween(
    int lower,
    int upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'series',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> tipoSerieEqualTo(int value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'tipoSerie',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> tipoSerieGreaterThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'tipoSerie',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> tipoSerieLessThan(
    int value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'tipoSerie',
        value: value,
      ));
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity,
      QAfterFilterCondition> tipoSerieBetween(
    int lower,
    int upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'tipoSerie',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }
}

extension ExercicioNoPlanoEntityQueryObject on QueryBuilder<
    ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QFilterCondition> {}

extension ExercicioNoPlanoEntityQueryLinks on QueryBuilder<
    ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QFilterCondition> {}

extension ExercicioNoPlanoEntityQuerySortBy
    on QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QSortBy> {
  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByDescansoSegundos() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descansoSegundos', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByDescansoSegundosDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descansoSegundos', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByDuracaoMetaSegundos() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'duracaoMetaSegundos', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByDuracaoMetaSegundosDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'duracaoMetaSegundos', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByExercicioId() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioId', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByExercicioIdDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioId', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByExercicioNome() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioNome', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByExercicioNomeDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioNome', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByNotas() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'notas', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByNotasDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'notas', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByOrdem() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'ordem', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByOrdemDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'ordem', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByPesoMeta() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'pesoMeta', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByPesoMetaDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'pesoMeta', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByPlanoId() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'planoId', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByPlanoIdDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'planoId', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByRepeticoesMeta() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'repeticoesMeta', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByRepeticoesMetaDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'repeticoesMeta', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortBySeries() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'series', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortBySeriesDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'series', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByTipoSerie() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'tipoSerie', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      sortByTipoSerieDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'tipoSerie', Sort.desc);
    });
  }
}

extension ExercicioNoPlanoEntityQuerySortThenBy on QueryBuilder<
    ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QSortThenBy> {
  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByDescansoSegundos() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descansoSegundos', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByDescansoSegundosDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descansoSegundos', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByDuracaoMetaSegundos() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'duracaoMetaSegundos', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByDuracaoMetaSegundosDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'duracaoMetaSegundos', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByExercicioId() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioId', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByExercicioIdDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioId', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByExercicioNome() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioNome', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByExercicioNomeDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'exercicioNome', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenById() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'id', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByIdDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'id', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByNotas() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'notas', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByNotasDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'notas', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByOrdem() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'ordem', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByOrdemDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'ordem', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByPesoMeta() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'pesoMeta', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByPesoMetaDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'pesoMeta', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByPlanoId() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'planoId', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByPlanoIdDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'planoId', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByRepeticoesMeta() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'repeticoesMeta', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByRepeticoesMetaDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'repeticoesMeta', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenBySeries() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'series', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenBySeriesDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'series', Sort.desc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByTipoSerie() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'tipoSerie', Sort.asc);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QAfterSortBy>
      thenByTipoSerieDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'tipoSerie', Sort.desc);
    });
  }
}

extension ExercicioNoPlanoEntityQueryWhereDistinct
    on QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct> {
  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByDescansoSegundos() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'descansoSegundos');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByDuracaoMetaSegundos() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'duracaoMetaSegundos');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByExercicioId({bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'exercicioId', caseSensitive: caseSensitive);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByExercicioNome({bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'exercicioNome',
          caseSensitive: caseSensitive);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByNotas({bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'notas', caseSensitive: caseSensitive);
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByOrdem() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'ordem');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByPesoMeta() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'pesoMeta');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByPlanoId() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'planoId');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByRepeticoesMeta() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'repeticoesMeta');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctBySeries() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'series');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QDistinct>
      distinctByTipoSerie() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'tipoSerie');
    });
  }
}

extension ExercicioNoPlanoEntityQueryProperty on QueryBuilder<
    ExercicioNoPlanoEntity, ExercicioNoPlanoEntity, QQueryProperty> {
  QueryBuilder<ExercicioNoPlanoEntity, int, QQueryOperations> idProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'id');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, int, QQueryOperations>
      descansoSegundosProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'descansoSegundos');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, int?, QQueryOperations>
      duracaoMetaSegundosProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'duracaoMetaSegundos');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, String, QQueryOperations>
      exercicioIdProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'exercicioId');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, String?, QQueryOperations>
      exercicioNomeProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'exercicioNome');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, String?, QQueryOperations>
      notasProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'notas');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, int, QQueryOperations> ordemProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'ordem');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, double?, QQueryOperations>
      pesoMetaProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'pesoMeta');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, int, QQueryOperations>
      planoIdProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'planoId');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, int, QQueryOperations>
      repeticoesMetaProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'repeticoesMeta');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, int, QQueryOperations> seriesProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'series');
    });
  }

  QueryBuilder<ExercicioNoPlanoEntity, int, QQueryOperations>
      tipoSerieProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'tipoSerie');
    });
  }
}
