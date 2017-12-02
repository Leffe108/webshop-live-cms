
function OnDragStart(event, elementType, existingElementIndex) {
	// Forbid dragging from toolbar if there are no elements left to add
	if (existingElementIndex === undefined && GetElementCountLeft(elementType) <= 0) {
		event.preventDefault();
	}

	event.dataTransfer.setData('elementType', elementType);
	if (existingElementIndex !== undefined) {
		event.dataTransfer.setData('elementIndex', JSON.stringify(existingElementIndex));
	}

}

function AllowDrop(event) {
	if (event.target === document.getElementById('browser') ||
		event.target === document.getElementById('browser-content')
	) {
		// Allow
		event.preventDefault();
	}

	// Reject
}

function OnDrop(event) {
	event.preventDefault();

	// Receive parameters
	var element_type = event.dataTransfer.getData('elementType');
	var element_index = event.dataTransfer.getData('elementIndex');
	var element = null;
	if (element_type === '') return;
	if (element_index !== '') {
		element_index = JSON.parse(element_index);
		if (element_index >= 0 && element_index < g_elements.length) {
			element = g_elements[element_index];
		}
	} else {
		element_index = null;
	}

	// => element_type
	// If moving existing these are given, otherwise (if not given) create new from toolbox
	// => element_index :number (optional)
	// => element :object (optional)

	console.log('elementType: ' + element_type);
	console.log('element: ', element);
	console.log(event);

	if (element === null) {
		AddElement(element_type, event.offsetX, event.offsetY);
	} else {
		MoveElement(element, element_index, event.offsetX, event.offsetY);
	}

	// Element type may have become empty
	UpdateToolboxUi();
}
