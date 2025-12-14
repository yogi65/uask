import { EnvConfigDTO } from '../common/dto/EnvConfigDTO';
import { FileUtils } from '../common/utils/FileUtils';

let config: EnvConfigDTO;

export default function globalSetup() {
    const envArg = process.env.ENV;
    if (!envArg) {
        throw new Error('Please provide an environment, e.g., ENV=qa');
    }
    config = FileUtils.getConfig(envArg);
}

globalSetup();
export { config };
