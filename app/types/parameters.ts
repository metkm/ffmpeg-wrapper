import type { parametersPerEncoders } from '~/constants'

export type Encoder = keyof typeof parametersPerEncoders

export interface Parameter {
  id: number
  name: string
  min: number
  max: number
  default: number
  type: 'inputnumber'
  description?: string
}
