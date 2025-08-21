import { JsonObject, JsonProperty } from 'json2typescript';
import { Money } from './Money';

const statusFormatted = {
	pending: 'Pending payment ⏱️',
	paid: 'Paid ✅'
};

@JsonObject('Bill')
export class Bill {
	@JsonProperty('id', String) id: string = '';
	@JsonProperty('status', String) status: string = '';
	@JsonProperty('created_at', String) createdAt: string = '';
	@JsonProperty('updated_at', String) updatedAt: string = '';
	@JsonProperty('date_since', String) dateSince: string = '';
	@JsonProperty('date_until', String) dateUntil: string = '';
	@JsonProperty('expiration', String) expiration: string = '';
	@JsonProperty('amount', Money) amount: Money = new Money();
	@JsonProperty('enable_anual_payment', Boolean) enableAnualPayment: boolean = false;
	@JsonProperty('anual_amount', Money) anualAmount: Money = new Money();
	
	public get statusFormatted () : string {
	    return statusFormatted[this.status as keyof typeof statusFormatted] || this.status;
	}
}
