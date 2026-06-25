import { T } from '@start9labs/start-sdk'

/**
 * Minimal manifest-type stub for the sibling `elements` (Liquid) package.
 *
 * The real elements-startos package is not yet published, so we cannot import
 * its manifest type the way we import `lnd-startos/startos/manifest`. Only the
 * `id` and `volumes` fields are used by `mountDependency`'s generic, so this
 * stub is sufficient for typing the read-only volume mount.
 *
 * TODO: once elements-startos is published, replace this stub with
 *   `import { manifest as elementsManifest } from 'elements-startos/startos/manifest'`
 * and add it as a devDependency in package.json (mirroring lnd-startos).
 */
export const elementsManifest = {
  id: 'elements',
  volumes: ['main'],
} as unknown as T.SDKManifest & { id: 'elements'; volumes: ['main'] }
