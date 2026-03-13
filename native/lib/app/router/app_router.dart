import 'dart:ui';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_colors.dart';
import '../../app/providers.dart';
import '../../features/auth/presentation/login_page.dart';
import '../../features/dashboard/presentation/dashboard_page.dart';
import '../../features/exercicios/presentation/exercicio_detalhe_page.dart';
import '../../features/exercicios/presentation/exercicios_page.dart';
import '../../features/historico/presentation/historico_page.dart';
import '../../features/perfil/presentation/perfil_page.dart';
import '../../features/treino_ativo/presentation/treino_ativo_placeholder_page.dart';
import '../../features/treinos/presentation/novo_plano_page.dart';
import '../../features/treinos/presentation/plano_detalhe_page.dart';
import '../../features/treinos/presentation/treinos_page.dart';

final appRouterProvider = Provider<GoRouter>(
  (ref) {
    final authNotifier = ref.read(authNotifierProvider);

    return GoRouter(
      initialLocation: '/dashboard',
      refreshListenable: authNotifier,
      redirect: (context, state) {
        final loggedIn = authNotifier.isLoggedIn;
        final onLogin = state.matchedLocation == '/login';
        // No Chrome (web) permite usar o app sem login para testar.
        if (kIsWeb) return null;
        if (!loggedIn && !onLogin) return '/login';
        if (loggedIn && onLogin) return '/dashboard';
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          name: 'login',
          builder: (context, state) => const LoginPage(),
        ),
        ShellRoute(
          builder: (context, state, child) {
            return _MainShell(child: child);
          },
          routes: [
            GoRoute(
              path: '/dashboard',
              name: 'dashboard',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: DashboardPage(),
              ),
            ),
            GoRoute(
              path: '/treinos',
              name: 'treinos',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: TreinosPage(),
              ),
              routes: [
                GoRoute(
                  path: 'novo',
                  name: 'novo-plano',
                  pageBuilder: (context, state) => const NoTransitionPage(
                    child: NovoPlanoPage(),
                  ),
                ),
                GoRoute(
                  path: ':id',
                  name: 'plano-detalhe',
                  pageBuilder: (context, state) {
                    final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
                    return NoTransitionPage(
                      child: PlanoDetalhePage(planoId: id),
                    );
                  },
                ),
              ],
            ),
            GoRoute(
              path: '/exercicios',
              name: 'exercicios',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: ExerciciosPage(),
              ),
              routes: [
                GoRoute(
                  path: ':id',
                  name: 'exercicio-detalhe',
                  pageBuilder: (context, state) {
                    final id = int.tryParse(state.pathParameters['id'] ?? '') ?? 0;
                    return NoTransitionPage(
                      child: ExercicioDetalhePage(exercicioId: id),
                    );
                  },
                ),
              ],
            ),
            GoRoute(
              path: '/historico',
              name: 'historico',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: HistoricoPage(),
              ),
            ),
            GoRoute(
              path: '/treino-ativo',
              name: 'treino-ativo',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: TreinoAtivoPlaceholderPage(),
              ),
            ),
            GoRoute(
              path: '/perfil',
              name: 'perfil',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: PerfilPage(),
              ),
            ),
          ],
        ),
      ],
    );
  },
);

class _MainShell extends StatelessWidget {
  const _MainShell({required this.child});

  final Widget child;

  // Ordem igual ao web: Início, Treinos, [Treinar], Exercícios, Perfil (sem Histórico na barra)
  static const _tabs = [
    _TabItem(location: '/dashboard', icon: Icons.home_outlined, label: 'Início'),
    _TabItem(location: '/treinos', icon: Icons.fitness_center_outlined, label: 'Treinos'),
    _TabItem(location: '/treino-ativo', icon: Icons.bolt_rounded, label: 'Treinar'),
    _TabItem(location: '/exercicios', icon: Icons.menu_book_outlined, label: 'Exercícios'),
    _TabItem(location: '/perfil', icon: Icons.person_outline, label: 'Perfil'),
  ];

  static const _treinarIndex = 2;

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: child,
      bottomNavigationBar: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.bottomNavBg,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            padding: EdgeInsets.only(
              top: 6,
              bottom: MediaQuery.paddingOf(context).bottom + 6,
            ),
            child: SafeArea(
              top: false,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  for (var i = 0; i < _tabs.length; i++)
                    if (i == _treinarIndex)
                      _TreinarPill(
                        isActive: location.startsWith('/treino-ativo'),
                        onTap: () => context.go('/treino-ativo'),
                      )
                    else
                      _BottomNavItem(
                        item: _tabs[i],
                        isSelected: location.startsWith(_tabs[i].location),
                      ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _TreinarPill extends StatelessWidget {
  const _TreinarPill({required this.isActive, required this.onTap});

  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: const Offset(0, -16), // -mt-4 do web (pill elevada)
      child: Material(
        color: AppColors.accent,
        borderRadius: BorderRadius.circular(16), // rounded-2xl
        elevation: 8,
        shadowColor: isActive ? AppColors.accentGlow : Colors.black26,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Transform.scale(
            scale: isActive ? 1.05 : 1.0, // scale-105 quando ativo
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12), // px-5 py-3
              child: Column(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.bolt_rounded, color: Colors.white, size: 22),
                  const SizedBox(height: 4), // gap-1
                  Text(
                    'Treinar',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 10,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _BottomNavItem extends StatelessWidget {
  const _BottomNavItem({
    required this.item,
    required this.isSelected,
  });

  final _TabItem item;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final color = isSelected ? AppColors.accent : AppColors.textMuted;

    return InkWell(
      onTap: () {
        if (!isSelected) context.go(item.location);
      },
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(item.icon, size: 22, color: color),
            const SizedBox(height: 4),
            Text(
              item.label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: color,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                    fontSize: 10,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabItem {
  const _TabItem({
    required this.location,
    required this.icon,
    required this.label,
  });

  final String location;
  final IconData icon;
  final String label;
}
