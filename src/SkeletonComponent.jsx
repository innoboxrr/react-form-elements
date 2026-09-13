import useTheme, { joinClasses } from './internal/useTheme.js'

const TOKENS = { text: 'skeletonText', circle: 'skeletonCircle', block: 'skeletonBlock' }

const size = (value) => (typeof value === 'number' ? `${value}px` : value)

/**
 * Gemelo de SkeletonComponent.vue: la forma de lo que va a llegar, mientras
 * llega.
 *
 *     <SkeletonComponent lines={3} />
 *     <SkeletonComponent shape="circle" width="3rem" />
 */
export default function SkeletonComponent({ shape = 'text', lines = 1, width = null, height = null }) {
    const theme = useTheme()

    const count = shape === 'text' ? Math.max(1, lines) : 1

    return (
        <div aria-hidden="true" data-shape={shape}>
            {Array.from({ length: count }, (_, index) => {
                const last = shape === 'text' && count > 1 && index === count - 1

                return (
                    <span
                        key={index}
                        className={joinClasses(theme.skeleton, theme[TOKENS[shape] ?? 'skeletonText'])}
                        style={{
                            width: last ? '60%' : (size(width) ?? undefined),
                            height: size(height) ?? undefined,
                        }} />
                )
            })}
        </div>
    )
}
