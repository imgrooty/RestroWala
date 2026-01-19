/**
 * Type declarations for @google/model-viewer
 */

declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'ar-scale'?: string;
        'ar-placement'?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'rotation-per-second'?: string;
        'interaction-policy'?: string;
        'shadow-intensity'?: string;
        exposure?: string;
        'environment-image'?: string;
        poster?: string;
      },
      HTMLElement
    > & {
      activateAR?: () => void;
    };
  }
}
