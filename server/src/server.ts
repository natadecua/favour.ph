const loadEnvFile = (process as typeof process & { loadEnvFile?: (path?: string) => void }).loadEnvFile
loadEnvFile?.('.env')

async function main() {
  const { buildApp } = await import('./app.js')
  const app = buildApp()

  app.listen(
    { port: Number(process.env['PORT'] ?? 3001), host: '0.0.0.0' },
    (err) => {
      if (err) {
        app.log.error(err)
        process.exit(1)
      }
    }
  )
}

void main()
