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

	/**
	 * Update subscription status
	 **/
	async updateSubscriptionStatus (status: string): Promise<User> {
		const res = await Server.post('v1/users/subscription', { subscription_status: status });

		return JsonConverter.deserializeObject(res.data, User);
	}

	/**
	 * Get payment method link
	 **/
	async getPaymentMethodLink (): Promise<{ link: string }> {
		const res = await Server.get('v1/users/payment-method-link');

		return res.data;
	}
}

const userService = new UserService();

export default userService;
