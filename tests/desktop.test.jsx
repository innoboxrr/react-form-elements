import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { confirmAction, notify, notifyError, resetConfirmation, resetToasts } from 'innoboxrr-form-core'

/**
 * El mismo doble de Iconify que usa el resto de la suite: los datos del icono
 * se piden por red y en las pruebas no hay.
 */
vi.mock('@iconify/react', () => ({
    Icon: ({ icon, width, height, className, ...rest }) => (
        <svg data-icon={icon} width={width ?? undefined} height={height ?? undefined} className={className ?? undefined} {...rest} />
    ),
}))

const { default: DialogComponent } = await import('../src/DialogComponent.jsx')
const { default: DrawerComponent } = await import('../src/DrawerComponent.jsx')
const { default: ToastRegionComponent } = await import('../src/ToastRegionComponent.jsx')
const { default: ConfirmHostComponent } = await import('../src/ConfirmHostComponent.jsx')
const { default: SkeletonComponent } = await import('../src/SkeletonComponent.jsx')

afterEach(() => {
    act(() => {
        resetToasts()
        resetConfirmation()
    })
})

const cancel = (element) => {
    const event = new Event('cancel', { cancelable: true })

    act(() => {
        element.dispatchEvent(event)
    })

    return event
}

const box = (element) => {
    element.getBoundingClientRect = () => ({ left: 100, right: 400, top: 100, bottom: 300 })
}

describe('DialogComponent', () => {
    it('abre y cierra desde open', () => {
        const { container, rerender } = render(<DialogComponent title="Borrar producto">Contenido</DialogComponent>)
        const dialog = container.querySelector('dialog')

        expect(dialog).not.toHaveAttribute('open')
        expect(dialog).not.toHaveTextContent('Contenido')

        rerender(<DialogComponent open title="Borrar producto">Contenido</DialogComponent>)

        expect(dialog).toHaveAttribute('open')
        expect(dialog).toHaveTextContent('Contenido')

        rerender(<DialogComponent open={false} title="Borrar producto">Contenido</DialogComponent>)

        expect(dialog).not.toHaveAttribute('open')
    })

    it('lo titula su encabezado', () => {
        const { container } = render(<DialogComponent open title="Borrar producto">x</DialogComponent>)

        expect(container.querySelector('dialog')).toHaveAttribute('aria-labelledby', container.querySelector('h2').id)
    })

    it('Escape pide cerrar sin cerrar por su cuenta', () => {
        const onOpenChange = vi.fn()
        const { container } = render(<DialogComponent open title="x" onOpenChange={onOpenChange}>x</DialogComponent>)
        const dialog = container.querySelector('dialog')

        expect(cancel(dialog).defaultPrevented).toBe(true)
        expect(onOpenChange).toHaveBeenCalledWith(false)
        expect(dialog).toHaveAttribute('open')
    })

    it('un clic en el fondo cierra; uno sobre la caja no', () => {
        const onOpenChange = vi.fn()
        const { container } = render(<DialogComponent open title="x" onOpenChange={onOpenChange}>x</DialogComponent>)
        const dialog = container.querySelector('dialog')

        box(dialog)

        fireEvent.click(dialog, { clientX: 200, clientY: 200 })
        expect(onOpenChange).not.toHaveBeenCalled()

        fireEvent.click(dialog, { clientX: 20, clientY: 20 })
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('sin dismissible no se cierra con Escape ni con el fondo, y no hay X', () => {
        const onOpenChange = vi.fn()
        const { container } = render(<DialogComponent open title="x" dismissible={false} onOpenChange={onOpenChange}>x</DialogComponent>)
        const dialog = container.querySelector('dialog')

        box(dialog)
        cancel(dialog)
        fireEvent.click(dialog, { clientX: 20, clientY: 20 })

        expect(onOpenChange).not.toHaveBeenCalled()
        expect(screen.queryByLabelText('Cerrar')).toBeNull()
    })

    it('la X y el pie cierran', () => {
        const onOpenChange = vi.fn()
        const onClose = vi.fn()

        render(
            <DialogComponent open title="x" onOpenChange={onOpenChange} onClose={onClose}
                footer={({ close }) => <button type="button" onClick={close}>Salir</button>}>
                x
            </DialogComponent>
        )

        fireEvent.click(screen.getByLabelText('Cerrar'))
        fireEvent.click(screen.getByText('Salir'))

        expect(onOpenChange.mock.calls).toEqual([[false], [false]])
        expect(onClose).toHaveBeenCalledTimes(2)
    })

    it('sale del tema, con el tamano pedido', () => {
        const { container } = render(<DialogComponent open title="x" size="lg" footer="Pie">Contenido</DialogComponent>)

        expect(container.querySelector('dialog').className).toBe('fe-dialog fe-dialog-lg')
        expect(container.querySelector('header').className).toBe('fe-dialog-header')
        expect(container.querySelector('.fe-dialog-body')).toHaveTextContent('Contenido')
        expect(container.querySelector('footer').className).toBe('fe-dialog-footer')
    })
})

describe('DrawerComponent', () => {
    const drawer = (props = {}) => render(
        <DrawerComponent open title="Nuevo producto" {...props}>
            <input id="nombre" />
        </DrawerComponent>
    )

    it('es un dialog con la forma del drawer', () => {
        const { container } = drawer()

        expect(container.querySelector('dialog').className).toBe('fe-drawer')
        expect(container.querySelector('header').className).toBe('fe-drawer-header')
        expect(container.querySelector('h2').className).toBe('fe-drawer-title')
    })

    it('se pega a la izquierda con side="start"', () => {
        expect(drawer({ side: 'start' }).container.querySelector('dialog').className).toBe('fe-drawer fe-drawer-start')
    })

    it('el contenido se desmonta al cerrar', () => {
        const { container, rerender } = drawer()

        expect(container.querySelector('#nombre')).not.toBeNull()

        rerender(
            <DrawerComponent open={false} title="Nuevo producto">
                <input id="nombre" />
            </DrawerComponent>
        )

        expect(container.querySelector('#nombre')).toBeNull()
    })
})

describe('ToastRegionComponent', () => {
    it('pinta los avisos de notify y los quita al cerrarlos', () => {
        const { container } = render(<ToastRegionComponent />)

        act(() => {
            notify({ message: 'Guardado', title: 'Producto', variant: 'success' })
        })

        const toast = screen.getByRole('status')

        expect(toast).toHaveTextContent('Producto')
        expect(toast).toHaveTextContent('Guardado')
        expect(toast.className).toBe('fe-toast fe-toast-success')

        fireEvent.click(screen.getByLabelText('Cerrar'))

        expect(container.querySelectorAll('.fe-toast')).toHaveLength(0)
    })

    it('un error se anuncia como alerta', () => {
        render(<ToastRegionComponent />)

        act(() => {
            notifyError('No se pudo guardar')
        })

        expect(screen.getByRole('alert')).toHaveTextContent('No se pudo guardar')
    })

    it('vive en la capa superior, como region con nombre', () => {
        const region = render(<ToastRegionComponent />).container.firstChild

        expect(region).toHaveAttribute('popover', 'manual')
        expect(region).toHaveAttribute('role', 'region')
        expect(region).toHaveAttribute('aria-label', 'Avisos')
        expect(region.className).toBe('fe-toast-region')
    })
})

describe('ConfirmHostComponent', () => {
    it('pregunta lo que pide confirmAction y devuelve la respuesta', async () => {
        const { container } = render(<ConfirmHostComponent />)
        let answer

        act(() => {
            answer = confirmAction({ message: '¿Borrar el producto?', variant: 'danger', confirmLabel: 'Borrar' })
        })

        const dialog = container.querySelector('dialog')

        expect(dialog).toHaveAttribute('open')
        expect(dialog).toHaveTextContent('¿Borrar el producto?')

        const [cancelar, borrar] = container.querySelectorAll('footer button')

        expect(cancelar).toHaveTextContent('Cancelar')
        expect(borrar).toHaveTextContent('Borrar')
        expect(borrar.className).toBe('fe-button-danger')

        fireEvent.click(borrar)

        await expect(answer).resolves.toBe(true)

        expect(dialog).not.toHaveAttribute('open')
    })

    it('cerrar con Escape cuenta como cancelar', async () => {
        const { container } = render(<ConfirmHostComponent />)
        let answer

        act(() => {
            answer = confirmAction('¿Seguro?')
        })

        cancel(container.querySelector('dialog'))

        await expect(answer).resolves.toBe(false)
    })

    it('el foco empieza en cancelar', () => {
        render(<ConfirmHostComponent />)

        act(() => {
            confirmAction('¿Seguro?')
        })

        expect(document.activeElement).toHaveTextContent('Cancelar')
    })
})

describe('SkeletonComponent', () => {
    it('varias lineas, la ultima mas corta', () => {
        const spans = render(<SkeletonComponent lines={3} />).container.querySelectorAll('span')

        expect(spans).toHaveLength(3)
        expect(spans[0].className).toBe('fe-skeleton fe-skeleton-text')
        expect(spans[2].style.width).toBe('60%')
    })

    it('un circulo con su tamano', () => {
        const spans = render(<SkeletonComponent shape="circle" width={48} />).container.querySelectorAll('span')

        expect(spans).toHaveLength(1)
        expect(spans[0].className).toBe('fe-skeleton fe-skeleton-circle')
        expect(spans[0].style.width).toBe('48px')
    })

    it('se oculta a los lectores de pantalla', () => {
        expect(render(<SkeletonComponent />).container.firstChild).toHaveAttribute('aria-hidden', 'true')
    })
})
