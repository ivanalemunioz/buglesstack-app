import Server from '@/libraries/Server';
import JsonConverter from '@/libraries/JsonConverter';
import { Crash } from '@/models/Crash';

class CrashService {
	/**
	 * Get crashes
	 **/
	async get (projectId: string, start: string = ''): Promise<Crash[]> {
		const res = await Server.get('v1/crashes', { params: { project_id: projectId, start } });

		return JsonConverter.deserializeArray(res.data, Crash);
	}

	/**
	 * Get crash by id
	 **/
	async getById (id: string): Promise<Crash> {
		const res = await Server.get(`v1/crashes/${id}`);

		return JsonConverter.deserializeObject(res.data, Crash);
	}

	/**
	 * Get crash by share token
	 **/
	async getShared (shareToken: string): Promise<Crash> {
		const res = await Server.get(`v1/crashes/shared/${shareToken}`);

		return JsonConverter.deserializeObject(res.data, Crash);
	}
}

const crashService = new CrashService();

export default crashService;
