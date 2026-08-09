<?php
/**
 * Plugin Name: XOF Admin Chalkboard
 * Plugin URI:  https://xofmedia.com
 * Description: A helpful chalkboard dashboard widget for admin notes and snippets.
 * Version:     1.0.0
 * Author:      XOF Media
 * Author URI:  https://xofmedia.com
 * License:     GPLv3
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: xof-admin-chalkboard
 */

// Exit if accessed directly to prevent unauthorized code execution.
if ( !defined( 'ABSPATH' ) ) {
    exit;
}

// Register the Chalkboard Dashboard Widget
function xof_add_chalkboard_widget() {
    if ( current_user_can( 'manage_options' ) ) {
        $title_html = '<img src="' . esc_url( plugin_dir_url( __FILE__ ) . 'images/xof-chalkboard-icon_64x.png' ) . '" alt="' . esc_attr__( 'XOF Chalkboard Logo', 'xof-admin-chalkboard' ) . '"> ' . esc_html__( 'XOF Chalkboard', 'xof-admin-chalkboard' );
        
        wp_add_dashboard_widget(
            'xof_chalkboard_widget',
            $title_html,
            'xof_render_chalkboard_widget'
        );
    }
}
add_action( 'wp_dashboard_setup', 'xof_add_chalkboard_widget' );

 // Enqueue scripts and styles
function xof_enqueue_chalkboard_assets( $hook ) {
    if ( 'index.php' !== $hook ) {
        return; 
    }

    $css_file = plugin_dir_path( __FILE__ ) . 'css/xof-admin-chalkboard.css';
    $css_version = file_exists( $css_file ) ? filemtime( $css_file ) : '1.0.0';
    wp_enqueue_style( 'xof-chalkboard-css', plugin_dir_url( __FILE__ ) . 'css/xof-admin-chalkboard.css', array(), $css_version );
    
    $js_file = plugin_dir_path( __FILE__ ) . 'js/xof-admin-chalkboard.js';
    $js_version = file_exists( $js_file ) ? filemtime( $js_file ) : '1.0.0';
    wp_enqueue_script( 'xof-chalkboard-js', plugin_dir_url( __FILE__ ) . 'js/xof-admin-chalkboard.js', array( 'jquery', 'jquery-ui-sortable' ), $js_version, true );

    // The 'i18n' array
    wp_localize_script( 'xof-chalkboard-js', 'xofChalkboard', array(
        'ajax_url'   => admin_url( 'admin-ajax.php' ),
        'nonce'      => wp_create_nonce( 'xof_chalkboard_nonce' ),
        'plugin_url' => plugin_dir_url( __FILE__ ),
        'i18n'       => array(
            'errorAdding'      => __( 'Error adding snippet: ', 'xof-admin-chalkboard' ),
            'editTitle'        => __( 'Edit Title', 'xof-admin-chalkboard' ),
            'save'             => __( 'Save', 'xof-admin-chalkboard' ),
            'copySnippet'      => __( 'Copy Snippet', 'xof-admin-chalkboard' ),
            'editSnippet'      => __( 'Edit Snippet', 'xof-admin-chalkboard' ),
            'saveSnippet'      => __( 'Save Snippet', 'xof-admin-chalkboard' ),
            'deleteSnippet'    => __( 'Delete Snippet', 'xof-admin-chalkboard' ),
            'dragToReorder'    => __( 'Drag to Reorder', 'xof-admin-chalkboard' ),
            'deleteConfirm'    => __( 'Delete?', 'xof-admin-chalkboard' ),
            'yes'              => __( 'Yes', 'xof-admin-chalkboard' ),
            'no'               => __( 'No', 'xof-admin-chalkboard' ),
            'chooseColor'      => __( 'Choose Color', 'xof-admin-chalkboard' ),
            'colorDefault'     => __( 'Default', 'xof-admin-chalkboard' ),
            'colorLightRed'    => __( 'Light Red', 'xof-admin-chalkboard' ),
            'colorLightOrange' => __( 'Light Orange', 'xof-admin-chalkboard' ),
            'colorLightYellow' => __( 'Light Yellow', 'xof-admin-chalkboard' ),
            'colorLightGreen'  => __( 'Light Green', 'xof-admin-chalkboard' ),
            'colorLightBlue'   => __( 'Light Blue', 'xof-admin-chalkboard' ),
            'colorLightPurple' => __( 'Light Purple', 'xof-admin-chalkboard' ),
            'errorDeleting'    => __( 'Error deleting snippet.', 'xof-admin-chalkboard' ),
            'saving'           => __( 'Saving...', 'xof-admin-chalkboard' ),
            'errorSavingTitle' => __( 'Error saving title.', 'xof-admin-chalkboard' ),
            'emptySnippet'     => __( 'Snippet cannot be empty. If you want to remove it, click the X.', 'xof-admin-chalkboard' ),
            'errorSaving'      => __( 'Error saving snippet.', 'xof-admin-chalkboard' ),
            'errorReorder'     => __( 'Error saving new snippet order. Please refresh.', 'xof-admin-chalkboard' ),
            'copied'           => __( 'Copied!', 'xof-admin-chalkboard' ),
            'clipboardError'   => __( 'Clipboard access denied or failed. Please copy manually.', 'xof-admin-chalkboard' ),
            'errorExporting'   => __( 'Error exporting snippets.', 'xof-admin-chalkboard' ),
            'errorImporting'   => __( 'Error importing snippets: ', 'xof-admin-chalkboard' ),
            'unsavedChanges'   => __( 'You have unsaved changes in your chalkboard. Are you sure you want to leave?', 'xof-admin-chalkboard' ),
        )
    ) );
}
add_action( 'admin_enqueue_scripts', 'xof_enqueue_chalkboard_assets' );

// ========================================
// Render the HTML for the dashboard widget
// ========================================
function xof_render_chalkboard_widget() {
    $user_id = get_current_user_id();
    $snippets = get_user_meta( $user_id, 'xof_chalkboard_snippets', true );
    if ( ! is_array( $snippets ) ) {
        $snippets = array();
    }

    $img_url = esc_url( plugin_dir_url( __FILE__ ) . 'images/' );

    echo '<div class="xof-chalkboard-container" id="xof-create-container">';
    echo '  <input type="text" id="xof-chalkboard-title-input" placeholder="' . esc_attr__( 'Title your snippet...', 'xof-admin-chalkboard' ) . '" />';
    echo '  <textarea id="xof-chalkboard-input" placeholder="' . esc_attr__( 'Paste your text, URL, or code snippet here...', 'xof-admin-chalkboard' ) . '"></textarea>';
    
    echo '  <div class="xof-chalkboard-add-controls">';
    echo '    <div class="xof-chalkboard-add-left">';
    echo '      <button type="button" id="xof-chalkboard-add" class="button button-primary">' . esc_html__( 'Add Snippet', 'xof-admin-chalkboard' ) . '</button>';
    echo '      <span id="xof-chalkboard-spinner" class="spinner"></span>';
    echo '    </div>';
    echo '    <div class="xof-color-picker-container xof-create-color-picker">';
    echo '      <input type="hidden" id="xof-chalkboard-color-input" value="#fcfcfc" />';
    echo '      <img src="' . $img_url . 'xof_chalkboard-rainbow-button_64x.png" class="xof-action-icon xof-rainbow-btn" title="' . esc_attr__( 'Choose Color', 'xof-admin-chalkboard' ) . '" alt="' . esc_attr__( 'Choose Color', 'xof-admin-chalkboard' ) . '" />';
    echo '      <span class="xof-color-label">' . esc_html__( 'Color', 'xof-admin-chalkboard' ) . '</span>';
    echo '      <div class="xof-color-bar" style="display:none;">';
    echo '        <div class="xof-color-swatch" data-color="#fcfcfc" style="background-color: #e0e0e0;" title="' . esc_attr__( 'Default', 'xof-admin-chalkboard' ) . '"></div>';
    echo '        <div class="xof-color-swatch" data-color="#ffe5e5" style="background-color: #ff9999;" title="' . esc_attr__( 'Light Red', 'xof-admin-chalkboard' ) . '"></div>';
    echo '        <div class="xof-color-swatch" data-color="#ffebd6" style="background-color: #ffb366;" title="' . esc_attr__( 'Light Orange', 'xof-admin-chalkboard' ) . '"></div>';
    echo '        <div class="xof-color-swatch" data-color="#fffae6" style="background-color: #ffe680;" title="' . esc_attr__( 'Light Yellow', 'xof-admin-chalkboard' ) . '"></div>';
    echo '        <div class="xof-color-swatch" data-color="#e8f5e9" style="background-color: #99cc99;" title="' . esc_attr__( 'Light Green', 'xof-admin-chalkboard' ) . '"></div>';
    echo '        <div class="xof-color-swatch" data-color="#e3f2fd" style="background-color: #99c2ff;" title="' . esc_attr__( 'Light Blue', 'xof-admin-chalkboard' ) . '"></div>';
    echo '        <div class="xof-color-swatch" data-color="#f3e5f5" style="background-color: #cc99ff;" title="' . esc_attr__( 'Light Purple', 'xof-admin-chalkboard' ) . '"></div>';
    echo '      </div>';
    echo '    </div>';
    echo '  </div>';
    echo '</div>';

    echo '<div class="xof-import-export-container">';
    echo '  <div class="xof-ie-action">';
    echo '    <a href="#" id="xof-import-btn">' . esc_html__( 'Import', 'xof-admin-chalkboard' ) . '</a>';
    echo '    <div class="xof-ie-tooltip">' . esc_html__( 'Import snippets from a JSON file.', 'xof-admin-chalkboard' ) . '</div>';
    echo '    <input type="file" id="xof-import-file" accept=".json" style="display:none;" />';
    echo '  </div>';
    echo '  <span class="xof-ie-separator">|</span>';
    echo '  <div class="xof-ie-action">';
    echo '    <a href="#" id="xof-export-btn">' . esc_html__( 'Export', 'xof-admin-chalkboard' ) . '</a>';
    echo '    <div class="xof-ie-tooltip">' . esc_html__( 'Export all snippets to a JSON file.', 'xof-admin-chalkboard' ) . '</div>';
    echo '  </div>';
    echo '</div>';

    echo '<hr class="xof-chalkboard-divider" />';

    echo '<ul id="xof-chalkboard-list">';
    
    foreach ( array_reverse( $snippets ) as $snippet ) {
        $title = isset( $snippet['title'] ) ? $snippet['title'] : __( 'Snippet', 'xof-admin-chalkboard' );
        $color = isset( $snippet['color'] ) ? $snippet['color'] : '#fcfcfc';
        
        echo '<li class="xof-chalkboard-item xof-is-collapsed" data-id="' . esc_attr( $snippet['id'] ) . '" style="background-color: ' . esc_attr( $color ) . ';">';
        echo '  <div class="xof-snippet-body">';
        echo '    <div class="xof-snippet-title-wrapper">';
        echo '      <div class="xof-snippet-title-bar">';
        echo '        <div class="xof-title-toggle-wrap" title="' . esc_attr__( 'Click to Expand/Collapse', 'xof-admin-chalkboard' ) . '">';
        echo '          <span class="xof-accordion-toggle"></span>';
        echo '          <span class="xof-title-text" style="color: #ffffff;">' . esc_html( $title ) . '</span>';
        echo '        </div>';
        echo '        <img src="' . $img_url . 'xof_chalkboard-title-edit-button_64x.png" class="xof-title-edit-icon" title="' . esc_attr__( 'Edit Title', 'xof-admin-chalkboard' ) . '" alt="' . esc_attr__( 'Edit Title', 'xof-admin-chalkboard' ) . '" />';
        echo '      </div>';
        echo '      <div class="xof-snippet-title-edit-container" style="display:none;">';
        echo '        <input type="text" class="xof-snippet-title-edit-input" value="' . esc_attr( $title ) . '" />';
        echo '        <button type="button" class="button button-small xof-title-save">' . esc_html__( 'Save', 'xof-admin-chalkboard' ) . '</button>';
        echo '      </div>';
        echo '    </div>';

        echo '    <div class="xof-snippet-collapse-wrap" style="display:none;">';
        echo '      <div class="xof-snippet-actions-horizontal">';
        echo '        <img src="' . $img_url . 'xof_chalkboard-copy-button_64x.png" class="xof-action-icon xof-chalkboard-copy" title="' . esc_attr__( 'Copy Snippet', 'xof-admin-chalkboard' ) . '" alt="' . esc_attr__( 'Copy Snippet', 'xof-admin-chalkboard' ) . '" />';
        echo '        <img src="' . $img_url . 'xof_chalkboard-edit2-button_64x.png" class="xof-action-icon xof-chalkboard-edit" title="' . esc_attr__( 'Edit Snippet', 'xof-admin-chalkboard' ) . '" alt="' . esc_attr__( 'Edit Snippet', 'xof-admin-chalkboard' ) . '" />';
        echo '      </div>';
        echo '      <div class="xof-snippet-content">' . nl2br( esc_html( $snippet['text'] ) ) . '</div>';
        echo '      <textarea class="xof-snippet-edit-input" style="display:none;">' . esc_textarea( $snippet['text'] ) . '</textarea>';
        
        echo '      <div class="xof-snippet-save-wrap" style="display:none;">';
        echo '        <button type="button" class="button button-primary button-small xof-chalkboard-save">' . esc_html__( 'Save Snippet', 'xof-admin-chalkboard' ) . '</button>';
        echo '      </div>';
        
        echo '    </div>';
        echo '  </div>';

        echo '  <div class="xof-snippet-order-controls">';
        echo '    <div class="xof-order-controls-top">';
        echo '      <div class="xof-standard-order-icons">';
        echo '        <img src="' . $img_url . 'xof_chalkboard-close2-button_64x.png" class="xof-order-icon xof-chalkboard-delete" title="' . esc_attr__( 'Delete Snippet', 'xof-admin-chalkboard' ) . '" alt="' . esc_attr__( 'Delete Snippet', 'xof-admin-chalkboard' ) . '" />';
        echo '        <img src="' . $img_url . 'xof_chalkboard-drag-button_64x.png" class="xof-order-icon xof-drag-handle" title="' . esc_attr__( 'Drag to Reorder', 'xof-admin-chalkboard' ) . '" alt="' . esc_attr__( 'Drag to Reorder', 'xof-admin-chalkboard' ) . '" />';
        echo '      </div>';
        echo '      <div class="xof-delete-confirm-tooltip" style="display:none;">';
        echo '        <span>' . esc_html__( 'Delete?', 'xof-admin-chalkboard' ) . '</span>';
        echo '        <button type="button" class="button button-small xof-confirm-delete-yes">' . esc_html__( 'Yes', 'xof-admin-chalkboard' ) . '</button>';
        echo '        <button type="button" class="button button-small xof-confirm-delete-no">' . esc_html__( 'No', 'xof-admin-chalkboard' ) . '</button>';
        echo '      </div>';
        echo '    </div>';
        
        echo '    <div class="xof-color-picker-container xof-edit-color-picker" style="display:none;">';
        echo '      <input type="hidden" class="xof-snippet-color-edit-input" value="' . esc_attr( $color ) . '" />';
        echo '      <img src="' . $img_url . 'xof_chalkboard-rainbow-button_64x.png" class="xof-action-icon xof-rainbow-btn" title="' . esc_attr__( 'Choose Color', 'xof-admin-chalkboard' ) . '" alt="' . esc_attr__( 'Choose Color', 'xof-admin-chalkboard' ) . '" />';
        echo '      <div class="xof-color-bar" style="display:none;">';
        echo '        <div class="xof-color-swatch" data-color="#fcfcfc" style="background-color: #e0e0e0;" title="' . esc_attr__( 'Default', 'xof-admin-chalkboard' ) . '"></div>';
        echo '        <div class="xof-color-swatch" data-color="#ffe5e5" style="background-color: #ff9999;" title="' . esc_attr__( 'Light Red', 'xof-admin-chalkboard' ) . '"></div>';
        echo '        <div class="xof-color-swatch" data-color="#ffebd6" style="background-color: #ffb366;" title="' . esc_attr__( 'Light Orange', 'xof-admin-chalkboard' ) . '"></div>';
        echo '        <div class="xof-color-swatch" data-color="#fffae6" style="background-color: #ffe680;" title="' . esc_attr__( 'Light Yellow', 'xof-admin-chalkboard' ) . '"></div>';
        echo '        <div class="xof-color-swatch" data-color="#e8f5e9" style="background-color: #99cc99;" title="' . esc_attr__( 'Light Green', 'xof-admin-chalkboard' ) . '"></div>';
        echo '        <div class="xof-color-swatch" data-color="#e3f2fd" style="background-color: #99c2ff;" title="' . esc_attr__( 'Light Blue', 'xof-admin-chalkboard' ) . '"></div>';
        echo '        <div class="xof-color-swatch" data-color="#f3e5f5" style="background-color: #cc99ff;" title="' . esc_attr__( 'Light Purple', 'xof-admin-chalkboard' ) . '"></div>';
        echo '      </div>';
        echo '    </div>';
        echo '  </div>';
        
        echo '</li>';
    }
    
    echo '</ul>';

    echo '<div class="xof-widget-footer">';
    echo '  <div class="xof-footer-brand">';
    echo '    <a href="https://xofmedia.com" target="_blank" rel="noopener noreferrer">';
    echo '      ' . esc_html__( 'Provided by', 'xof-admin-chalkboard' ) . ' <img src="' . $img_url . 'xof-chalkboard-footer-logo_264x50.png" alt="' . esc_attr__( 'XOF Media Logo', 'xof-admin-chalkboard' ) . '" />';
    echo '    </a>';
    echo '    <div class="xof-brand-tooltip">' . esc_html__( 'Provided by XOFmedia.com', 'xof-admin-chalkboard' ) . '</div>';
    echo '  </div>';
    
    echo '  <div class="xof-footer-donate">';
    echo '    <a href="https://xofmedia.com/buy-me-a-coffee" target="_blank" rel="noopener noreferrer">';
    echo '      <img src="' . $img_url . 'xof_chalkboard-coffee_64x.png" alt="' . esc_attr__( 'Buy me a coffee', 'xof-admin-chalkboard' ) . '" />';
    echo '    </a>';
    echo '    <div class="xof-donate-tooltip">' . esc_html__( 'If you appreciate my work and it\'s helped you out in some way, consider buying me a coffee.', 'xof-admin-chalkboard' ) . '</div>';
    echo '  </div>';
    echo '</div>';
}

// ===============================
// AJAX Handler: Add a new snippet
// ===============================
function xof_ajax_add_snippet() {
    // Security check
    check_ajax_referer( 'xof_chalkboard_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( __( 'Permission denied.', 'xof-admin-chalkboard' ) );
    }

    if ( current_user_can( 'unfiltered_html' ) ) {
        $raw_text = isset( $_POST['text'] ) ? wp_unslash( $_POST['text'] ) : '';
    } else {
        $raw_text = isset( $_POST['text'] ) ? wp_kses_post( wp_unslash( $_POST['text'] ) ) : '';
    }

    $raw_title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
    $raw_color = isset( $_POST['color'] ) ? sanitize_hex_color( $_POST['color'] ) : '#fcfcfc';
    
    if ( empty( trim( $raw_text ) ) ) {
        wp_send_json_error( __( 'Text cannot be empty.', 'xof-admin-chalkboard' ) );
    }

    $user_id = get_current_user_id();
    $snippets = get_user_meta( $user_id, 'xof_chalkboard_snippets', true );
    if ( ! is_array( $snippets ) ) {
        $snippets = array();
    }

    if ( empty( trim( $raw_title ) ) ) {
        $count = count( $snippets ) + 1;
        $raw_title = sprintf( esc_html__( 'Snippet %d', 'xof-admin-chalkboard' ), $count );
    }

    $new_snippet = array(
        'id'    => uniqid( 'snip_' ),
        'title' => $raw_title,
        'text'  => $raw_text,
        'color' => $raw_color
    );

    $snippets[] = $new_snippet;
    update_user_meta( $user_id, 'xof_chalkboard_snippets', $snippets );

    wp_send_json_success( array(
        'id'         => $new_snippet['id'],
        'title_html' => esc_html( $new_snippet['title'] ),
        'title_raw'  => $new_snippet['title'],
        'html'       => nl2br( esc_html( $new_snippet['text'] ) ),
        'raw'        => $new_snippet['text'],
        'color'      => $new_snippet['color']
    ) );
}
add_action( 'wp_ajax_xof_add_snippet', 'xof_ajax_add_snippet' );

// ==============================
// AJAX Handler: Delete a snippet
// ==============================
function xof_ajax_delete_snippet() {
    // Security check
    check_ajax_referer( 'xof_chalkboard_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( __( 'Permission denied.', 'xof-admin-chalkboard' ) );
    }

    $snippet_id = isset( $_POST['snippet_id'] ) ? sanitize_text_field( $_POST['snippet_id'] ) : '';
    if ( empty( $snippet_id ) ) {
        wp_send_json_error( __( 'No snippet ID provided.', 'xof-admin-chalkboard' ) );
    }

    $user_id = get_current_user_id();
    $snippets = get_user_meta( $user_id, 'xof_chalkboard_snippets', true );
    
    if ( is_array( $snippets ) ) {
        $updated_snippets = array_filter( $snippets, function( $snippet ) use ( $snippet_id ) {
            return $snippet['id'] !== $snippet_id;
        });

        update_user_meta( $user_id, 'xof_chalkboard_snippets', array_values( $updated_snippets ) );
    }

    wp_send_json_success();
}
add_action( 'wp_ajax_xof_delete_snippet', 'xof_ajax_delete_snippet' );

// ======================================
// AJAX Handler: Edit an existing snippet
// ======================================
function xof_ajax_edit_snippet() {
    // Security check
    check_ajax_referer( 'xof_chalkboard_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( __( 'Permission denied.', 'xof-admin-chalkboard' ) );
    }

    $snippet_id = isset( $_POST['snippet_id'] ) ? sanitize_text_field( $_POST['snippet_id'] ) : '';
    
    if ( current_user_can( 'unfiltered_html' ) ) {
        $raw_text = isset( $_POST['text'] ) ? wp_unslash( $_POST['text'] ) : '';
    } else {
        $raw_text = isset( $_POST['text'] ) ? wp_kses_post( wp_unslash( $_POST['text'] ) ) : '';
    }

    $raw_title = isset( $_POST['title'] ) ? sanitize_text_field( wp_unslash( $_POST['title'] ) ) : '';
    $raw_color = isset( $_POST['color'] ) ? sanitize_hex_color( $_POST['color'] ) : '';

    if ( empty( $snippet_id ) || empty( trim( $raw_text ) ) ) {
        wp_send_json_error( __( 'Invalid data or empty text.', 'xof-admin-chalkboard' ) );
    }

    $user_id = get_current_user_id();
    $snippets = get_user_meta( $user_id, 'xof_chalkboard_snippets', true );
    
    if ( is_array( $snippets ) ) {
        $updated_color = '#fcfcfc'; 
        
        foreach ( $snippets as &$snippet ) {
            if ( $snippet['id'] === $snippet_id ) {
                $snippet['text'] = $raw_text;
                
                if ( ! empty( $raw_color ) ) {
                    $snippet['color'] = $raw_color;
                }
                $updated_color = isset( $snippet['color'] ) ? $snippet['color'] : '#fcfcfc';
                
                $fallback = __( 'Snippet', 'xof-admin-chalkboard' ); 
                $snippet['title'] = ! empty( trim( $raw_title ) ) ? $raw_title : $fallback;
                break; 
            }
        }

        update_user_meta( $user_id, 'xof_chalkboard_snippets', $snippets );

        wp_send_json_success( array(
            'title_html' => esc_html( $snippet['title'] ),
            'html'       => nl2br( esc_html( $raw_text ) ),
            'color'      => $updated_color
        ) );
    } else {
        wp_send_json_error( __( 'Snippet not found.', 'xof-admin-chalkboard' ) );
    }
}
add_action( 'wp_ajax_xof_edit_snippet', 'xof_ajax_edit_snippet' );

// =================================================
// AJAX Handler: Reorder a snippet via drag and drop
// =================================================
function xof_ajax_reorder_snippet() {
    // Security check
    check_ajax_referer( 'xof_chalkboard_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( __( 'Permission denied.', 'xof-admin-chalkboard' ) );
    }

    $snippet_ids = isset( $_POST['snippet_ids'] ) ? array_map('sanitize_text_field', wp_unslash($_POST['snippet_ids'])) : array();

    if ( empty( $snippet_ids ) ) {
        wp_send_json_error( __( 'No valid data provided.', 'xof-admin-chalkboard' ) );
    }

    $user_id = get_current_user_id();
    $snippets = get_user_meta( $user_id, 'xof_chalkboard_snippets', true );
    
    if ( is_array( $snippets ) ) {
        $new_snippets_array = array();
        
        foreach ( $snippet_ids as $id ) {
            foreach ( $snippets as $snippet ) {
                if ( $snippet['id'] === $id ) {
                    $new_snippets_array[] = $snippet;
                    break;
                }
            }
        }
        
        $new_snippets_array = array_reverse( $new_snippets_array );

        update_user_meta( $user_id, 'xof_chalkboard_snippets', $new_snippets_array );
        wp_send_json_success();
    } else {
        wp_send_json_error( __( 'No snippets found.', 'xof-admin-chalkboard' ) );
    }
}
add_action( 'wp_ajax_xof_reorder_snippet', 'xof_ajax_reorder_snippet' );

// ================================================
// AJAX Handler: Export all snippets to a JSON File
// ================================================
function xof_ajax_export_snippets() {
    // Security check
    check_ajax_referer( 'xof_chalkboard_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( __( 'Permission denied.', 'xof-admin-chalkboard' ) );
    }

    $user_id = get_current_user_id();
    $snippets = get_user_meta( $user_id, 'xof_chalkboard_snippets', true );
    if ( ! is_array( $snippets ) ) {
        $snippets = array();
    }

    wp_send_json_success( wp_json_encode( $snippets ) );
}
add_action( 'wp_ajax_xof_export_snippets', 'xof_ajax_export_snippets' );

// ==============================================
// AJAX Handler: Import snippets from a JSON file
// ==============================================
function xof_ajax_import_snippets() {
    // Security check
    check_ajax_referer( 'xof_chalkboard_nonce', 'nonce' );
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( __( 'Permission denied.', 'xof-admin-chalkboard' ) );
    }

    $imported_data = isset( $_POST['import_data'] ) ? wp_unslash( $_POST['import_data'] ) : '';
    $imported_snippets = json_decode( $imported_data, true );

    if ( json_last_error() !== JSON_ERROR_NONE || ! is_array( $imported_snippets ) ) {
        wp_send_json_error( __( 'Invalid JSON format.', 'xof-admin-chalkboard' ) );
    }

    $user_id = get_current_user_id();
    $existing_snippets = get_user_meta( $user_id, 'xof_chalkboard_snippets', true );
    if ( ! is_array( $existing_snippets ) ) {
        $existing_snippets = array();
    }

    foreach ( $imported_snippets as $snippet ) {
        $safe_color = isset( $snippet['color'] ) ? sanitize_hex_color( $snippet['color'] ) : '';
        $final_color = ! empty( $safe_color ) ? $safe_color : '#fcfcfc';

        if ( current_user_can( 'unfiltered_html' ) ) {
            $safe_text = isset( $snippet['text'] ) ? $snippet['text'] : '';
        } else {
            $safe_text = isset( $snippet['text'] ) ? wp_kses_post( $snippet['text'] ) : '';
        }

        $new_snippet = array(
            'id'    => uniqid( 'snip_' ), 
            'title' => isset( $snippet['title'] ) ? sanitize_text_field( $snippet['title'] ) : __( 'Imported Snippet', 'xof-admin-chalkboard' ),
            'text'  => $safe_text, 
            'color' => $final_color
        );
        $existing_snippets[] = $new_snippet; 
    }

    update_user_meta( $user_id, 'xof_chalkboard_snippets', $existing_snippets );
    wp_send_json_success();
}
add_action( 'wp_ajax_xof_import_snippets', 'xof_ajax_import_snippets' );