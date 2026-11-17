"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useEffect, useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(String(item.quantity))

  useEffect(() => {
    setQuantity(String(item.quantity))
  }, [item.quantity])

  const maxQuantity =
    item.variant?.manage_inventory &&
    !item.variant.allow_backorder &&
    typeof item.variant.inventory_quantity === "number"
      ? Math.max(item.quantity, item.variant.inventory_quantity)
      : undefined

  const changeQuantity = async () => {
    const nextQuantity = Number(quantity)
    if (
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 1 ||
      (maxQuantity !== undefined && nextQuantity > maxQuantity)
    ) {
      setError(
        maxQuantity === undefined
          ? "Enter a quantity of at least 1."
          : `Only ${maxQuantity} units are available.`
      )
      setQuantity(String(item.quantity))
      return
    }

    if (nextQuantity === item.quantity) {
      return
    }

    setError(null)
    setUpdating(true)

    try {
      await updateLineItem({
        lineId: item.id,
        quantity: nextQuantity,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update quantity.")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Table.Row className="w-full border-b border-neutral-200/80" data-testid="product-row">
      <Table.Cell className="!pl-0 py-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left py-4">
        <Text
          className="text-base font-semibold text-neutral-900 leading-snug"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <label className="sr-only" htmlFor={`quantity-${item.id}`}>
              Quantity for {item.product_title}
            </label>
            <input
              id={`quantity-${item.id}`}
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(event) => {
                setQuantity(event.target.value)
                setError(null)
              }}
              onBlur={changeQuantity}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.currentTarget.blur()
                }
              }}
              disabled={updating}
              className="w-16 h-10 rounded border border-ui-border-base px-2 text-center"
              data-testid="product-select-button"
              aria-invalid={Boolean(error)}
            />
            {updating && <Spinner />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{item.quantity}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
