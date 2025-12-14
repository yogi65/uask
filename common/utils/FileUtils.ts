import * as fs from 'fs';
import * as path from 'path';
import { EnvConfigDTO } from '../dto/EnvConfigDTO';

export namespace FileUtils {
    export function getConfig(env: string): EnvConfigDTO {
        const configPath = path.resolve(__dirname, `../../config/${env.toLowerCase()}.json`);

        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration file for environment ${env} not found`);
        }

        // Read and parse the config JSON file
        const configData = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(configData) as EnvConfigDTO;
    }
}
