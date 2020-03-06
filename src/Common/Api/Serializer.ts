import * as types from 'Common/Api/types';

export default class Serializer {
	private readonly classNamesByType: Map<Object, string> = new Map();

	constructor() {
		const allTypes: { [type: string]: Object } = types;
		for (const type in allTypes) {
			this.classNamesByType.set(allTypes[type], type);
		}
	}

	toJsonApi (o: any): any {
		const serializeObject = (o: any): any => {
			if (o === null) {
				return null;
			} else if (o instanceof Array) {
				return (<[]>o).map(item => serializeObject(item));
			} else if (o instanceof Object && o.constructor !== Object) {
				const result: any = {
					id: null,
					type: (this.classNamesByType.get(o.constructor) || null),
					attributes: {},
				};

				if (result.type === null) {
					throw new Error(`Type not serializable: ${o.constructor}`);
				}

				if (typeof o.id !== 'undefined') {
					result.id = o.id;
				}

				for (const prop in o) {
					if (o.hasOwnProperty(prop) && prop !== 'id' && !(o[prop] instanceof Function)) {
						result.attributes[prop] = serializeObject(<any>o[prop]);
					}
				}

				return result;
			} else {
				return o;
			}
		};

		return {
			data: serializeObject(o),
		};
	}
}
