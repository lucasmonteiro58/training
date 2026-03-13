import 'package:shared_preferences/shared_preferences.dart';

/// Chaves de preferências (paridade com localStorage do web).
abstract final class PrefsKeys {
  static const String metaSemanal = 'metaSemanal';
  static const String notificationsEnabled = 'notificationsEnabled';
}

/// Serviço de preferências locais (SharedPreferences).
class PrefsService {
  PrefsService(this._prefs);

  final SharedPreferences _prefs;

  int get metaSemanal => _prefs.getInt(PrefsKeys.metaSemanal) ?? 4;

  Future<void> setMetaSemanal(int value) async {
    await _prefs.setInt(PrefsKeys.metaSemanal, value);
  }

  bool get notificationsEnabled =>
      _prefs.getBool(PrefsKeys.notificationsEnabled) ?? true;

  Future<void> setNotificationsEnabled(bool value) async {
    await _prefs.setBool(PrefsKeys.notificationsEnabled, value);
  }
}
