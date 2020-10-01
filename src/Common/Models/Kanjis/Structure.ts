import KanjiPartPosition from 'Common/Types/KanjiPartPosition';

type Stroke = string;

export default class Structure {
	public readonly element: string;
	public readonly position: KanjiPartPosition|null;
	public readonly components: ReadonlyArray<Structure|Stroke>;

	constructor(
		element: string,
		position: KanjiPartPosition|null,
		components: ReadonlyArray<Structure|Stroke>,
	) {
		this.element = element;
		this.position = position;
		this.components = components;
	}

	toApi(): object {
		return {
			element: this.element,
			position: this.position,
			components: this.components.map((component) => {
				if (typeof component === 'string') {
					return <string>component;
				} else {
					return component.toApi();
				}
			}),
		};
	}

	public static fromApi(data: any): Structure {
		return new Structure(
			data.element,
			data.position || null,
			!data.components ? [] : data.components.map((component: any) => {
				if (typeof component === 'string') {
					return <Stroke>component;
				} else {
					return Structure.fromApi(component);
				}
			}),
		);
	}
}
