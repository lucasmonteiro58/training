import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/services/prefs_service.dart';
import '../features/auth/data/auth_notifier.dart';
import '../features/auth/data/auth_service.dart';

final prefsProvider = FutureProvider<SharedPreferences>(
  (_) => SharedPreferences.getInstance(),
);

final prefsServiceProvider = FutureProvider<PrefsService>(
  (ref) async {
    final prefs = await ref.watch(prefsProvider.future);
    return PrefsService(prefs);
  },
);

final authNotifierProvider =
    ChangeNotifierProvider<AuthNotifier>((_) => AuthNotifier());

final authServiceProvider = Provider<AuthService>((_) => AuthService());
