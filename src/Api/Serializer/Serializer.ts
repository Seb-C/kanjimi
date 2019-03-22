export default class Serializer {
	private const types: Readonly<{ [typeName: string]: Object }> = {
		// TODO types
		// TODO use symbols to reverse it?
		// TODO isolate in a easy to read import file?
		// TODO test
	};

	toJsonApi (o: any): Object {
		//    "type": "articles",
		//    "id": "1",
		//    "attributes": {
		//      "title": "JSON:API paints my bikeshed!"
		//    },
		//    "relationships": {
	}

	fromJsonApi (o: Object): any {
	}
}
