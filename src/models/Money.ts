import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Money')
export class Money {
	@JsonProperty('amount', Number) amount: number = 0;
	@JsonProperty('currency', String) currency: string = 'USD';

	get formatted () : string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: this.currency,
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		}).format(this.amount / 100);
	}
}
