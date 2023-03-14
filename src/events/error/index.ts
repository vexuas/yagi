import { sendErrorLog } from '../../utils/helpers';
import { EventModule } from '../events';

export default function ({ yagi }: EventModule) {
  yagi.on('error', (error: Error) => {
    sendErrorLog(yagi, error);
  });
}
