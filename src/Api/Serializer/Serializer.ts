import * as types from 'Api/Serializer/types';

export default class Serializer {
	private readonly typesByClassName: Map<string, Object> = new Map();
	private readonly classNamesByType: Map<Object, string> = new Map();

	constructor() {
		const allTypes: { [type: string]: Object } = types;
		for (const type in allTypes) {
			this.typesByClassName.set(type, allTypes[type]);
			this.classNamesByType.set(allTypes[type], type);
		}
	}

	protected getType(className: Object): string|null {
		return this.classNamesByType.get(className) || null;
	}

	protected getClass(type: string): Object|null {
		return this.typesByClassName.get(type) || null;
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
					type: this.getType(o.constructor),
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
					const typeClass = this.getClass(o.type);
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
