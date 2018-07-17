/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Modal } from '@wordpress/components';
import { Component } from '@wordpress/element';
import {
	getBlockType,
	createBlock,
	rawHandler,
	getBlockAttributes,
	getSaveContent,
} from '@wordpress/blocks';
import { withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import Warning from '../warning';
import BlockCompare from '../block-compare';

export class BlockInvalidWarning extends Component {
	constructor( props ) {
		super( props );

		this.state = { compare: false };
		this.onCompare = this.onCompare.bind( this );
		this.onCompareClose = this.onCompareClose.bind( this );
	}

	onCompare() {
		this.setState( { compare: true } );
	}

	onCompareClose() {
		this.setState( { compare: false } );
	}

	render() {
		const { convertToHTML, convertToBlocks, convertToClassic, overwriteBlock, block } = this.props;
		const hasHTMLBlock = !! getBlockType( 'core/html' );
		const { compare } = this.state;
		const secondaryActions = [
			{ title: __( 'Convert to Blocks' ), onClick: convertToBlocks },
			{ title: __( 'Convert to Classic Block' ), onClick: convertToClassic },
			{ title: __( 'Overwrite' ), onClick: overwriteBlock },
			{ title: __( 'Compare conversion' ), onClick: this.onCompare },
		];

		if ( compare ) {
			return (
				<Modal
					title={ __( 'Compare Block Conversion' ) }
					onRequestClose={ this.onCompareClose }
					className="editor-block-compare"
					focusOnMount={ false }
					shouldCloseOnClickOutside={ false }
				>
					<BlockCompare
						block={ block }
						onKeep={ convertToHTML }
						onConvert={ convertToBlocks }
						convertor={ blockToBlocks }
						convertorText={ __( 'Convert to Blocks' ) }
					/>
				</Modal>
			);
		}

		return (
			<Warning
				primaryActions={ [
					<Button key="convert" onClick={ convertToBlocks } isLarge isPrimary={ ! hasHTMLBlock }>
						{ __( 'Convert to Blocks' ) }
					</Button>,
					hasHTMLBlock && (
						<Button key="edit" onClick={ convertToHTML } isLarge isPrimary>
							{ __( 'Keep as HTML' ) }
						</Button>
					),
				] }
				secondaryActions={ secondaryActions }
			>
				{ __( 'This block has been modified externally.' ) }
			</Warning>
		);
	}
}

const blockToClassic = ( block ) => createBlock( 'core/freeform', {
	content: block.originalContent,
} );
const blockToHTML = ( block ) => createBlock( 'core/html', {
	content: block.originalContent,
} );
const blockToBlocks = ( block ) => rawHandler( {
	HTML: block.originalContent,
	mode: 'BLOCKS',
} );
const blockSave = ( block ) => createBlock( block.name,
	getBlockAttributes( getBlockType( block.name ), getSaveContent( getBlockType( block.name ), block.attributes ) )
);

export default withDispatch( ( dispatch, { block } ) => {
	const { replaceBlock } = dispatch( 'core/editor' );

	return {
		convertToClassic() {
			replaceBlock( block.clientId, blockToClassic( block ) );
		},
		convertToHTML() {
			replaceBlock( block.clientId, blockToHTML( block ) );
		},
		convertToBlocks() {
			replaceBlock( block.clientId, blockToBlocks( block ) );
		},
		overwriteBlock() {
			replaceBlock( block.clientId, blockSave( block ) );
		},
	};
} )( BlockInvalidWarning );
