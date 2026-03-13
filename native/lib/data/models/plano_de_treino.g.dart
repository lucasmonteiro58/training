// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'plano_de_treino.dart';

// **************************************************************************
// IsarCollectionGenerator
// **************************************************************************

// coverage:ignore-file
// ignore_for_file: duplicate_ignore, non_constant_identifier_names, constant_identifier_names, invalid_use_of_protected_member, unnecessary_cast, prefer_const_constructors, lines_longer_than_80_chars, require_trailing_commas, inference_failure_on_function_invocation, unnecessary_parenthesis, unnecessary_raw_strings, unnecessary_null_checks, join_return_with_assignment, prefer_final_locals, avoid_js_rounded_ints, avoid_positional_boolean_parameters, always_specify_types

extension GetPlanoDeTreinoCollection on Isar {
  IsarCollection<PlanoDeTreino> get planoDeTreinos => this.collection();
}

const PlanoDeTreinoSchema = CollectionSchema(
  name: r'PlanoDeTreino',
  // Valor ajustado para ser seguro em JavaScript (necessario para web).
  id: 1,
  properties: {
    r'arquivado': PropertySchema(
      id: 0,
      name: r'arquivado',
      type: IsarType.bool,
    ),
    r'atualizadoEm': PropertySchema(
      id: 1,
      name: r'atualizadoEm',
      type: IsarType.dateTime,
    ),
    r'cor': PropertySchema(
      id: 2,
      name: r'cor',
      type: IsarType.long,
    ),
    r'criadoEm': PropertySchema(
      id: 3,
      name: r'criadoEm',
      type: IsarType.dateTime,
    ),
    r'descricao': PropertySchema(
      id: 4,
      name: r'descricao',
      type: IsarType.string,
    ),
    r'nome': PropertySchema(
      id: 5,
      name: r'nome',
      type: IsarType.string,
    )
  },
  estimateSize: _planoDeTreinoEstimateSize,
  serialize: _planoDeTreinoSerialize,
  deserialize: _planoDeTreinoDeserialize,
  deserializeProp: _planoDeTreinoDeserializeProp,
  idName: r'id',
  indexes: {},
  links: {},
  embeddedSchemas: {},
  getId: _planoDeTreinoGetId,
  getLinks: _planoDeTreinoGetLinks,
  attach: _planoDeTreinoAttach,
  version: '3.1.0+1',
);

int _planoDeTreinoEstimateSize(
  PlanoDeTreino object,
  List<int> offsets,
  Map<Type, List<int>> allOffsets,
) {
  var bytesCount = offsets.last;
  {
    final value = object.descricao;
    if (value != null) {
      bytesCount += 3 + value.length * 3;
    }
  }
  bytesCount += 3 + object.nome.length * 3;
  return bytesCount;
}

void _planoDeTreinoSerialize(
  PlanoDeTreino object,
  IsarWriter writer,
  List<int> offsets,
  Map<Type, List<int>> allOffsets,
) {
  writer.writeBool(offsets[0], object.arquivado);
  writer.writeDateTime(offsets[1], object.atualizadoEm);
  writer.writeLong(offsets[2], object.cor);
  writer.writeDateTime(offsets[3], object.criadoEm);
  writer.writeString(offsets[4], object.descricao);
  writer.writeString(offsets[5], object.nome);
}

PlanoDeTreino _planoDeTreinoDeserialize(
  Id id,
  IsarReader reader,
  List<int> offsets,
  Map<Type, List<int>> allOffsets,
) {
  final object = PlanoDeTreino();
  object.arquivado = reader.readBool(offsets[0]);
  object.atualizadoEm = reader.readDateTimeOrNull(offsets[1]);
  object.cor = reader.readLongOrNull(offsets[2]);
  object.criadoEm = reader.readDateTime(offsets[3]);
  object.descricao = reader.readStringOrNull(offsets[4]);
  object.id = id;
  object.nome = reader.readString(offsets[5]);
  return object;
}

P _planoDeTreinoDeserializeProp<P>(
  IsarReader reader,
  int propertyId,
  int offset,
  Map<Type, List<int>> allOffsets,
) {
  switch (propertyId) {
    case 0:
      return (reader.readBool(offset)) as P;
    case 1:
      return (reader.readDateTimeOrNull(offset)) as P;
    case 2:
      return (reader.readLongOrNull(offset)) as P;
    case 3:
      return (reader.readDateTime(offset)) as P;
    case 4:
      return (reader.readStringOrNull(offset)) as P;
    case 5:
      return (reader.readString(offset)) as P;
    default:
      throw IsarError('Unknown property with id $propertyId');
  }
}

Id _planoDeTreinoGetId(PlanoDeTreino object) {
  return object.id;
}

List<IsarLinkBase<dynamic>> _planoDeTreinoGetLinks(PlanoDeTreino object) {
  return [];
}

void _planoDeTreinoAttach(
    IsarCollection<dynamic> col, Id id, PlanoDeTreino object) {
  object.id = id;
}

extension PlanoDeTreinoQueryWhereSort
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QWhere> {
  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterWhere> anyId() {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(const IdWhereClause.any());
    });
  }
}

extension PlanoDeTreinoQueryWhere
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QWhereClause> {
  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterWhereClause> idEqualTo(
      Id id) {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(IdWhereClause.between(
        lower: id,
        upper: id,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterWhereClause> idNotEqualTo(
      Id id) {
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

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterWhereClause> idGreaterThan(
      Id id,
      {bool include = false}) {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(
        IdWhereClause.greaterThan(lower: id, includeLower: include),
      );
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterWhereClause> idLessThan(
      Id id,
      {bool include = false}) {
    return QueryBuilder.apply(this, (query) {
      return query.addWhereClause(
        IdWhereClause.lessThan(upper: id, includeUpper: include),
      );
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterWhereClause> idBetween(
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

extension PlanoDeTreinoQueryFilter
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QFilterCondition> {
  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      arquivadoEqualTo(bool value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'arquivado',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      atualizadoEmIsNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNull(
        property: r'atualizadoEm',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      atualizadoEmIsNotNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNotNull(
        property: r'atualizadoEm',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      atualizadoEmEqualTo(DateTime? value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'atualizadoEm',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      atualizadoEmGreaterThan(
    DateTime? value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'atualizadoEm',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      atualizadoEmLessThan(
    DateTime? value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'atualizadoEm',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      atualizadoEmBetween(
    DateTime? lower,
    DateTime? upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'atualizadoEm',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      corIsNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNull(
        property: r'cor',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      corIsNotNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNotNull(
        property: r'cor',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> corEqualTo(
      int? value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'cor',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      corGreaterThan(
    int? value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'cor',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> corLessThan(
    int? value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'cor',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> corBetween(
    int? lower,
    int? upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'cor',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      criadoEmEqualTo(DateTime value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'criadoEm',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      criadoEmGreaterThan(
    DateTime value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'criadoEm',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      criadoEmLessThan(
    DateTime value, {
    bool include = false,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'criadoEm',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      criadoEmBetween(
    DateTime lower,
    DateTime upper, {
    bool includeLower = true,
    bool includeUpper = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'criadoEm',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoIsNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNull(
        property: r'descricao',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoIsNotNull() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(const FilterCondition.isNotNull(
        property: r'descricao',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoEqualTo(
    String? value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'descricao',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoGreaterThan(
    String? value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'descricao',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoLessThan(
    String? value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'descricao',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoBetween(
    String? lower,
    String? upper, {
    bool includeLower = true,
    bool includeUpper = true,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'descricao',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoStartsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.startsWith(
        property: r'descricao',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoEndsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.endsWith(
        property: r'descricao',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoContains(String value, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.contains(
        property: r'descricao',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoMatches(String pattern, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.matches(
        property: r'descricao',
        wildcard: pattern,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoIsEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'descricao',
        value: '',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      descricaoIsNotEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        property: r'descricao',
        value: '',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> idEqualTo(
      Id value) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'id',
        value: value,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      idGreaterThan(
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

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> idLessThan(
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

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> idBetween(
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

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> nomeEqualTo(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'nome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      nomeGreaterThan(
    String value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        include: include,
        property: r'nome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      nomeLessThan(
    String value, {
    bool include = false,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.lessThan(
        include: include,
        property: r'nome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> nomeBetween(
    String lower,
    String upper, {
    bool includeLower = true,
    bool includeUpper = true,
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.between(
        property: r'nome',
        lower: lower,
        includeLower: includeLower,
        upper: upper,
        includeUpper: includeUpper,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      nomeStartsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.startsWith(
        property: r'nome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      nomeEndsWith(
    String value, {
    bool caseSensitive = true,
  }) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.endsWith(
        property: r'nome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      nomeContains(String value, {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.contains(
        property: r'nome',
        value: value,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition> nomeMatches(
      String pattern,
      {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.matches(
        property: r'nome',
        wildcard: pattern,
        caseSensitive: caseSensitive,
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      nomeIsEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.equalTo(
        property: r'nome',
        value: '',
      ));
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterFilterCondition>
      nomeIsNotEmpty() {
    return QueryBuilder.apply(this, (query) {
      return query.addFilterCondition(FilterCondition.greaterThan(
        property: r'nome',
        value: '',
      ));
    });
  }
}

extension PlanoDeTreinoQueryObject
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QFilterCondition> {}

extension PlanoDeTreinoQueryLinks
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QFilterCondition> {}

extension PlanoDeTreinoQuerySortBy
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QSortBy> {
  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> sortByArquivado() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'arquivado', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      sortByArquivadoDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'arquivado', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      sortByAtualizadoEm() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'atualizadoEm', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      sortByAtualizadoEmDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'atualizadoEm', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> sortByCor() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'cor', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> sortByCorDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'cor', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> sortByCriadoEm() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'criadoEm', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      sortByCriadoEmDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'criadoEm', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> sortByDescricao() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descricao', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      sortByDescricaoDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descricao', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> sortByNome() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'nome', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> sortByNomeDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'nome', Sort.desc);
    });
  }
}

extension PlanoDeTreinoQuerySortThenBy
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QSortThenBy> {
  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByArquivado() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'arquivado', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      thenByArquivadoDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'arquivado', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      thenByAtualizadoEm() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'atualizadoEm', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      thenByAtualizadoEmDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'atualizadoEm', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByCor() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'cor', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByCorDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'cor', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByCriadoEm() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'criadoEm', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      thenByCriadoEmDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'criadoEm', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByDescricao() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descricao', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy>
      thenByDescricaoDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'descricao', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenById() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'id', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByIdDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'id', Sort.desc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByNome() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'nome', Sort.asc);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QAfterSortBy> thenByNomeDesc() {
    return QueryBuilder.apply(this, (query) {
      return query.addSortBy(r'nome', Sort.desc);
    });
  }
}

extension PlanoDeTreinoQueryWhereDistinct
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QDistinct> {
  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QDistinct> distinctByArquivado() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'arquivado');
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QDistinct>
      distinctByAtualizadoEm() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'atualizadoEm');
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QDistinct> distinctByCor() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'cor');
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QDistinct> distinctByCriadoEm() {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'criadoEm');
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QDistinct> distinctByDescricao(
      {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'descricao', caseSensitive: caseSensitive);
    });
  }

  QueryBuilder<PlanoDeTreino, PlanoDeTreino, QDistinct> distinctByNome(
      {bool caseSensitive = true}) {
    return QueryBuilder.apply(this, (query) {
      return query.addDistinctBy(r'nome', caseSensitive: caseSensitive);
    });
  }
}

extension PlanoDeTreinoQueryProperty
    on QueryBuilder<PlanoDeTreino, PlanoDeTreino, QQueryProperty> {
  QueryBuilder<PlanoDeTreino, int, QQueryOperations> idProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'id');
    });
  }

  QueryBuilder<PlanoDeTreino, bool, QQueryOperations> arquivadoProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'arquivado');
    });
  }

  QueryBuilder<PlanoDeTreino, DateTime?, QQueryOperations>
      atualizadoEmProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'atualizadoEm');
    });
  }

  QueryBuilder<PlanoDeTreino, int?, QQueryOperations> corProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'cor');
    });
  }

  QueryBuilder<PlanoDeTreino, DateTime, QQueryOperations> criadoEmProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'criadoEm');
    });
  }

  QueryBuilder<PlanoDeTreino, String?, QQueryOperations> descricaoProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'descricao');
    });
  }

  QueryBuilder<PlanoDeTreino, String, QQueryOperations> nomeProperty() {
    return QueryBuilder.apply(this, (query) {
      return query.addPropertyName(r'nome');
    });
  }
}
