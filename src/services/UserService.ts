import Server from '@/libraries/Server';
import JsonConverter from '@/libraries/JsonConverter';
import { User } from '@/models//User';

class UserService {
	/**
	 * Get my data
	 **/
	async getMe (): Promise<User> {
		const res = await Server.get('v1/users/me');

		return JsonConverter.deserializeObject(res.data, User);
	}
}

const userService = new UserService();

export default userService;
