/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { IconButton, Toolbar } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockControls from '../block-controls';
import MediaPlaceholder from '../media-placeholder';
import MediaUpload from '../media-upload';

class MediaContainer extends Component {
	renderToolbarEditButton() {
		const { mediaId, onSelectMedia } = this.props;
		return (
			<BlockControls>
				<Toolbar>
					<MediaUpload
						onSelect={ onSelectMedia }
						type="image/*,video/*"
						value={ mediaId }
						render={ ( { open } ) => (
							<IconButton
								className="components-toolbar__control"
								label={ __( 'Edit Media' ) }
								icon="edit"
								onClick={ open }
							/>
						) }
					/>
				</Toolbar>
			</BlockControls>
		);
	}

	renderImage() {
		const { mediaAlt, mediaUrl } = this.props;
		return (
			<Fragment>
				{ this.renderEditToolbarButton() }
				<img src={ mediaUrl } alt={ mediaAlt } />
			</Fragment>
		);
	}

	renderVideo() {
		const { mediaUrl } = this.props;
		return (
			<Fragment>
				{ this.renderEditToolbarButton() }
				<video controls src={ mediaUrl } />
			</Fragment>
		);
	}

	renderPlaceholder() {
		const { onSelectMedia } = this.props;
		return (
			<MediaPlaceholder
				icon="format-image"
				labels={ {
					title: __( 'Media area' ),
					name: __( 'a media file (image or video)' ),
				} }
				className="block-library-half-media__media-placeholder"
				onSelect={ onSelectMedia }
				accept="image/*,video/*"
				type="image/*,video/*"
			/>
		);
	}

	render() {
		const { mediaUrl, mediaType } = this.props;
		if ( mediaType && mediaUrl ) {
			switch ( mediaType ) {
				case 'image':
					return this.renderImage();
				case 'video':
					return this.renderVideo();
			}
		}
		return this.renderPlaceholder();
	}
}

export default MediaContainer;
