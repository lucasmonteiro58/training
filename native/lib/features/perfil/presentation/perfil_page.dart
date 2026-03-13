import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../app/providers.dart';
import '../../../core/constants/app_colors.dart';

class PerfilPage extends ConsumerWidget {
  const PerfilPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authNotifierProvider).currentUser;

    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Perfil'),
      ),
      body: ListView(
        padding: const EdgeInsets.only(left: 16, right: 16, top: 8, bottom: 80),
        children: [
          if (user != null) ...[
            ListTile(
              leading: CircleAvatar(
                backgroundColor: AppColors.surface2,
                backgroundImage: user.photoURL != null
                    ? NetworkImage(user.photoURL!)
                    : null,
                child: user.photoURL == null
                    ? Text(
                        (user.displayName ?? user.email ?? '?')
                            .substring(0, 1)
                            .toUpperCase(),
                        style: const TextStyle(color: AppColors.textMuted),
                      )
                    : null,
              ),
              title: Text(
                user.displayName ?? 'Usuário',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.text,
                    ),
              ),
              subtitle: user.email != null
                  ? Text(
                      user.email!,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppColors.textMuted,
                          ),
                    )
                  : null,
            ),
            const SizedBox(height: 24),
          ],
          Text(
            'Tela de perfil, estatísticas e configurações.\nSerá preenchida nas etapas 5 e 6.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.textMuted,
                ),
            textAlign: TextAlign.center,
          ),
          if (user != null) ...[
            const SizedBox(height: 32),
            OutlinedButton.icon(
              onPressed: () async {
                await ref.read(authServiceProvider).signOut();
                if (context.mounted) context.go('/login');
              },
              icon: const Icon(Icons.logout_rounded),
              label: const Text('Sair'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.textMuted,
                side: BorderSide(color: AppColors.border),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
