import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/perfil/evolucao')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/perfil/evolucao"!</div>
}
