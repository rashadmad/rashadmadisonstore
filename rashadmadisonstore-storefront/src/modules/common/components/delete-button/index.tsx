import { deleteLineItem } from "@lib/data/cart"
import { Spinner, Trash } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await deleteLineItem(id).catch((err) => {
      setIsDeleting(false)
    })
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className="flex gap-x-1 text-neutral-600 hover:text-neutral-900 cursor-pointer font-medium group-[.cart-dropdown]:text-yellow-500 group-[.cart-dropdown]:hover:text-yellow-400"
        onClick={() => handleDelete(id)}
      >
        {isDeleting ? <Spinner className="animate-spin text-neutral-600 group-[.cart-dropdown]:text-yellow-500" /> : <Trash className="text-neutral-600 group-[.cart-dropdown]:text-yellow-500" />}
        <span>{children}</span>
      </button>
    </div>
  )
}

export default DeleteButton
