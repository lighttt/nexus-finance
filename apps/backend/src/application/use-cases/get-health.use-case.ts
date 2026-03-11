export interface HealthStatus {
  ok: boolean
}

export class GetHealthUseCase {
  execute(): HealthStatus {
    return { ok: true }
  }
}
