import snapshot from '../../public/data/v1/catalog.json' with { type: 'json' }
import changes from '../../public/data/v1/changes.json' with { type: 'json' }
import { catalogSchema, changesFeedSchema } from './schema'

export const catalog = catalogSchema.parse(snapshot)
export const snapshotDate = catalog.generatedAt.slice(0, 10)
export const acceptedChanges = changesFeedSchema.parse(changes).changes
