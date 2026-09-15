import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading, Table } from "@medusajs/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="pb-4 flex items-center border-b border-neutral-200">
        <Heading level="h1" className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
          Cart
        </Heading>
      </div>
      <Table className="mt-2">
        <Table.Header className="border-t-0 border-b border-neutral-200">
          <Table.Row className="text-neutral-700 font-semibold text-xs sm:text-sm uppercase tracking-wider">
            <Table.HeaderCell className="!pl-0 py-3 text-neutral-800 font-bold">Item</Table.HeaderCell>
            <Table.HeaderCell className="py-3"></Table.HeaderCell>
            <Table.HeaderCell className="py-3 text-neutral-800 font-bold">Quantity</Table.HeaderCell>
            <Table.HeaderCell className="hidden small:table-cell py-3 text-neutral-800 font-bold">
              Price
            </Table.HeaderCell>
            <Table.HeaderCell className="!pr-0 text-right py-3 text-neutral-800 font-bold">
              Total
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default ItemsTemplate
