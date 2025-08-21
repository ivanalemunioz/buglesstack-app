import Server from '@/libraries/Server';
import JsonConverter from '@/libraries/JsonConverter';
import { Bill } from '@/models//Bill';

class BillService {
	/**
	 * Get tax ids
	 **/
	async get (start: string = ''): Promise<Bill[]> {
		const res = await Server.get('v1/users/bills', { params: { start } });

		return JsonConverter.deserializeArray(res.data, Bill);
	}

	/**
	 * Get payment link
	 **/
	async getPaymentLink (id: string, year: boolean): Promise<{ link: string }> {
		const res = await Server.get(`v1/users/bills/${id}/payment-link`, {
			params: {
				year: year ? '1' : '0'
			}
		});

		return res.data;
	}
}

const billService = new BillService();

export default billService;
