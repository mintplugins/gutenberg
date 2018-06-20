/**
 * External dependencies
 */
import { noop } from 'lodash';
import classnames from 'classnames';
import ResizableBox from 're-resizable';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	BlockAlignmentToolbar,
	InnerBlocks,
	InspectorControls,
	getColorClass,
	PanelColorSettings,
	withColors,
	MediaContainer,
} from '@wordpress/editor';
import { Component, Fragment } from '@wordpress/element';
import { withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';

const MEDIA_POSITIONS = [ 'left', 'right' ];

export const name = 'core/half-media';
const ALLOWED_BLOCKS = [ 'core/button', 'core/paragraph', 'core/heading', 'core/list' ];
const TEMPLATE = [
	[ 'core/paragraph', { fontSize: 'large', placeholder: 'Content...' } ],
];

export const settings = {
	title: __( 'Half Media' ),

	icon: <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M0,0h24v24H0V0z" fill="none" /><rect x="11" y="7" width="6" height="2" /><rect x="11" y="11" width="6" height="2" /><rect x="11" y="15" width="6" height="2" /><rect x="7" y="7" width="2" height="2" /><rect x="7" y="11" width="2" height="2" /><rect x="7" y="15" width="2" height="2" /><path d="M20.1,3H3.9C3.4,3,3,3.4,3,3.9v16.2C3,20.5,3.4,21,3.9,21h16.2c0.4,0,0.9-0.5,0.9-0.9V3.9C21,3.4,20.5,3,20.1,3z M19,19H5V5h14V19z" /></svg>,

	category: 'layout',

	attributes: {
		width: {
			type: 'number',
			default: 300,
		},
		backgroundColor: {
			type: 'string',
		},
		customBackgroundColor: {
			type: 'string',
		},
		mediaAlt: {
			type: 'string',
			source: 'attribute',
			selector: 'img',
			attribute: 'alt',
			default: '',
		},
		mediaPosition: {
			type: 'string',
			default: 'left',
		},
		mediaId: {
			type: 'number',
		},
		mediaUrl: {
			type: 'string',
			source: 'attribute',
			selector: 'video,img',
			attribute: 'src',
		},
		mediaType: {
			type: 'string',
		},
	},

	supports: {
		align: [ 'center', 'wide', 'full' ],
	},

	edit: compose( [
		withColors( 'backgroundColor' ),
		withSelect( ( select ) => {
			return {
				wideControlsEnabled: select( 'core/editor' ).getEditorSettings().alignWide,
			};
		} ),
	] )(
		class extends Component {
			constructor() {
				super( ...arguments );

				this.onSelectMedia = this.onSelectMedia.bind( this );
			}
			componentWillMount() {
				if ( this.props.wideControlsEnabled && ! this.props.attributes.align ) {
					this.props.setAttributes( {
						align: 'wide',
					} );
				}
			}

			onSelectMedia( media ) {
				const { setAttributes } = this.props;
				setAttributes( {
					mediaAlt: media.alt,
					mediaId: media.id,
					mediaType: media.type,
					mediaUrl: media.url,
				} );
			}

			renderMediaArea() {
				const { attributes, setAttributes } = this.props;
				const { mediaAlt, mediaId, mediaPosition, mediaType, mediaUrl, width } = attributes;
				const handleClasses = {
					left: 'block-library-half-media__resize-handler',
					right: 'block-library-half-media__resize-handler',
				};
				const onResizeStop = ( event, direction, elt, delta ) => {
					setAttributes( {
						width: parseInt( width + delta.width, 10 ),
					} );
				};
				const enablePositions = {
					right: mediaPosition === 'left',
					left: mediaPosition === 'right',
				};
				return (
					<ResizableBox
						className="block-library-half-media__resizer"
						size={ { width } }
						minWidth="100"
						handleClasses={ handleClasses }
						enable={ enablePositions }
						onResizeStop={ onResizeStop }
						axis="x"
					>
						<MediaContainer
							onSelectMedia={ this.onSelectMedia }
							{ ...{ mediaAlt, mediaId, mediaType, mediaUrl } }
						/>
					</ResizableBox>
				);
			}

			render() {
				const { attributes, backgroundColor, setAttributes, setBackgroundColor } = this.props;
				const className = classnames( 'wp-block-half-media', {
					'has-media-on-the-right': 'right' === attributes.mediaPosition,
					[ backgroundColor.class ]: backgroundColor.class,
				} );
				const style = {
					backgroundColor: backgroundColor.value,
				};
				const colorSettings = [ {
					value: backgroundColor.value,
					onChange: setBackgroundColor,
					label: __( 'Background Color' ),
				} ];
				return (
					<Fragment>
						<div className={ className } style={ style } >
							{ this.renderMediaArea() }
							<InnerBlocks
								allowedBlocks={ ALLOWED_BLOCKS }
								template={ TEMPLATE }
							/>
						</div>
						<InspectorControls>
							<PanelColorSettings
								title={ __( 'Color Settings' ) }
								initialOpen={ false }
								colorSettings={ colorSettings }
							/>
						</InspectorControls>
						<BlockControls>
							<BlockAlignmentToolbar
								controls={ MEDIA_POSITIONS }
								value={ attributes.mediaPosition }
								onChange={ ( mediaPosition ) => setAttributes( { mediaPosition } ) }
							/>
						</BlockControls>
					</Fragment>
				);
			}
		} ),

	save( { attributes } ) {
		const {
			backgroundColor,
			customBackgroundColor,
			mediaAlt,
			mediaPosition,
			mediaType,
			mediaUrl,
			width,
		} = attributes;
		const mediaTypeRenders = {
			image: () => {
				return (
					<img src={ mediaUrl } alt={ mediaAlt } />
				);
			},
			video: () => {
				return (
					<video controls src={ mediaUrl } />
				);
			},
		};

		const className = classnames( {
			'has-media-on-the-right': 'right' === mediaPosition,
			[ backgroundClass ]: backgroundClass,
		} );
		const backgroundClass = getColorClass( 'background-color', backgroundColor );
		const style = {
			backgroundColor: backgroundClass ? undefined : customBackgroundColor,
		};
		return (
			<div className={ className } style={ style }>
				<figure className="wp-block-half-media__media" style={ { width } }>
					{ ( mediaTypeRenders[ mediaType ] || noop )() }
				</figure>
				<div className="wp-block-half-media__content">
					<InnerBlocks.Content />
				</div>
			</div>
		);
	},
};
