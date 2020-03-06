import * as types from 'Common/Api/types';

export default class Unserializer {
	private readonly typesByClassName: Map<string, Object> = new Map();

	constructor() {
		const allTypes: { [type: string]: Object } = types;
		for (const type in allTypes) {
			this.typesByClassName.set(type, allTypes[type]);
		}
	}

	fromJsonApi<T>(o: any): T {
		const unserializeObject = (o: any): any => {
			if (o === null) {
				return null;
			} else if (o instanceof Array) {
				return (<[]>o).map(item => unserializeObject(item));
			} else if (o instanceof Object) {
				const attributes: any = {};

				if (o.id) {
					attributes.id = o.id;
				}

				if (o.attributes) {
					for (const prop in o.attributes) {
						if (o.attributes.hasOwnProperty(prop) && !(o.attributes[prop] instanceof Function)) {
							attributes[prop] = unserializeObject(<any>o.attributes[prop]);
						}
					}
				}

				if (o.type) {
					const typeClass: Object|null = this.typesByClassName.get(o.type) || null;
					if (typeClass) {
						// @ts-ignore
						return Object.assign(new (<T>typeClass)(), attributes);
					} else {
						throw new Error(`Type not unserialize: ${o.type}`);
					}
				}

				return attributes;
			} else {
				return o;
			}
		};

		return unserializeObject(o.data);
	}
}
