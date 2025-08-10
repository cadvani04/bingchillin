from typing import List

from fastapi import APIRouter, HTTPException

from ....schemas.item import Item, ItemCreate, ItemUpdate


router = APIRouter()

_items_store: dict[int, Item] = {}
_next_item_id: int = 1


def _get_next_id() -> int:
    global _next_item_id
    current_id = _next_item_id
    _next_item_id += 1
    return current_id


@router.get("/", response_model=List[Item])
def list_items() -> List[Item]:
    return list(_items_store.values())


@router.post("/", response_model=Item, status_code=201)
def create_item(payload: ItemCreate) -> Item:
    item = Item(id=_get_next_id(), name=payload.name, description=payload.description)
    _items_store[item.id] = item
    return item


@router.get("/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    item = _items_store.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.put("/{item_id}", response_model=Item)
def update_item(item_id: int, payload: ItemUpdate) -> Item:
    item = _items_store.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    updated = item.model_copy(update=payload.model_dump(exclude_unset=True))
    _items_store[item_id] = updated
    return updated


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int) -> None:
    if item_id not in _items_store:
        raise HTTPException(status_code=404, detail="Item not found")

    del _items_store[item_id]
    return None 