"use client"

import * as React from "react"
import { cn } from "lib/cn"
import { ArrowLeft, XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useTranslation } from "react-i18next"

import { Button } from "components/ui/button"
import {
  EDITOR_PAGE_ID,
  ENTITY_PAGE_LABELS,
  type EntityPageSection,
  useActiveEntityPage,
  useEntityPagePrefs,
} from "lib/entityPages"

const EntityPageContext = React.createContext<EntityPageSection | null>(null)

function Dialog({
  section,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  section?: EntityPageSection
}) {
  const asPage = useEntityPagePrefs((state) => Boolean(section && state.pages[section]))
  const open = Boolean(props.open)

  React.useEffect(() => {
    if (!section || !asPage || !open) return
    useActiveEntityPage.getState().activate(section)
    return () => useActiveEntityPage.getState().release(section)
  }, [section, asPage, open])

  const pageSection = asPage && section ? section : null

  return (
    <EntityPageContext.Provider value={pageSection}>
      <DialogPrimitive.Root data-slot="dialog" modal={!pageSection} {...props} />
    </EntityPageContext.Provider>
  )
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-rb-fade-out data-[state=open]:animate-rb-fade-in",
        className
      )}
      {...props}
    />
  )
}

function EntityPageBackLink({ section }: { section: EntityPageSection }) {
  const { t } = useTranslation()

  return (
    <DialogPrimitive.Close asChild>
      <button
        type="button"
        data-slot="entity-page-back"
        className="inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t(`entityPages.${section}`, ENTITY_PAGE_LABELS[section])}
      </button>
    </DialogPrimitive.Close>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const pageSection = React.useContext(EntityPageContext)

  if (pageSection) {
    return (
      <DialogPrimitive.Portal container={document.getElementById(EDITOR_PAGE_ID)}>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            className,
            "static grid w-full max-w-[1100px] gap-4 border-0 bg-transparent p-0 shadow-none outline-none sm:max-w-[1100px] max-h-none overflow-visible"
          )}
          onInteractOutside={(event) => event.preventDefault()}
          {...props}
        >
          <EntityPageBackLink section={pageSection} />
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    )
  }

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-rb-pop-out data-[state=open]:animate-rb-pop-in sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 end-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-start", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const pageSection = React.useContext(EntityPageContext)

  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        pageSection && "sticky bottom-0 z-10 border-t bg-panel-main py-3",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline" size="sm">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
