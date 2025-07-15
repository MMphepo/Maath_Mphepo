// Enhanced Blog Admin JavaScript

(function($) {
    'use strict';

    // Initialize when DOM is ready
    $(document).ready(function() {
        initBlogAdmin();
    });

    function initBlogAdmin() {
        // Initialize all admin enhancements
        initMetaDescriptionCounter();
        initWordCounter();
        initAutoSave();
        initPreviewFunctionality();
        initImagePreview();
        initFormValidation();
        initKeyboardShortcuts();
    }

    // Meta Description Character Counter
    function initMetaDescriptionCounter() {
        const metaDescField = $('#id_meta_description');
        if (metaDescField.length) {
            const maxLength = 160;
            const counter = $('<div class="meta-description-counter"></div>');
            metaDescField.after(counter);

            function updateCounter() {
                const length = metaDescField.val().length;
                const remaining = maxLength - length;
                
                counter.text(`${length}/${maxLength} characters`);
                
                if (length > maxLength) {
                    counter.removeClass('warning').addClass('error');
                } else if (length > maxLength * 0.9) {
                    counter.removeClass('error').addClass('warning');
                } else {
                    counter.removeClass('error warning');
                }
            }

            metaDescField.on('input', updateCounter);
            updateCounter();
        }
    }

    // Word Counter for Content
    function initWordCounter() {
        const contentField = $('textarea[name="content"]');
        if (contentField.length) {
            const counter = $('<div class="word-count-display">Words: 0</div>');
            contentField.after(counter);

            function updateWordCount() {
                let content = contentField.val();
                
                // If CKEditor is present, get content from it
                if (window.CKEDITOR && CKEDITOR.instances.id_content) {
                    content = CKEDITOR.instances.id_content.getData();
                }
                
                // Strip HTML tags and count words
                const text = content.replace(/<[^>]*>/g, '').trim();
                const words = text ? text.split(/\s+/).length : 0;
                const readTime = Math.max(1, Math.ceil(words / 200));
                
                counter.html(`Words: <strong>${words.toLocaleString()}</strong> | Read time: <strong>${readTime} min</strong>`);
            }

            // Update on content change
            contentField.on('input', updateWordCount);
            
            // Update when CKEditor content changes
            if (window.CKEDITOR) {
                CKEDITOR.on('instanceReady', function(ev) {
                    if (ev.editor.name === 'id_content') {
                        ev.editor.on('change', updateWordCount);
                        updateWordCount();
                    }
                });
            }
            
            updateWordCount();
        }
    }

    // Auto-save functionality
    function initAutoSave() {
        let autoSaveTimer;
        const autoSaveInterval = 30000; // 30 seconds
        
        function autoSave() {
            const form = $('form#blogpost_form');
            if (form.length) {
                const formData = new FormData(form[0]);
                formData.append('auto_save', 'true');
                
                // Show saving indicator
                showSavingIndicator();
                
                $.ajax({
                    url: form.attr('action'),
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        showSaveSuccess();
                    },
                    error: function() {
                        showSaveError();
                    }
                });
            }
        }

        function startAutoSave() {
            autoSaveTimer = setInterval(autoSave, autoSaveInterval);
        }

        function stopAutoSave() {
            if (autoSaveTimer) {
                clearInterval(autoSaveTimer);
            }
        }

        // Start auto-save for existing posts
        if ($('#id_id').val()) {
            startAutoSave();
        }

        // Stop auto-save when form is submitted
        $('form').on('submit', stopAutoSave);
    }

    // Preview functionality
    function initPreviewFunctionality() {
        const previewBtn = $('<a href="#" class="btn-preview">Preview Post</a>');
        $('.submit-row').prepend(previewBtn);

        previewBtn.on('click', function(e) {
            e.preventDefault();
            
            const postId = $('#id_id').val();
            if (postId) {
                const previewUrl = `/admin/blog/blogpost/${postId}/preview/`;
                window.open(previewUrl, '_blank', 'width=1200,height=800,scrollbars=yes');
            } else {
                alert('Please save the post first to preview it.');
            }
        });
    }

    // Image preview functionality
    function initImagePreview() {
        const bannerField = $('#id_banner_image');
        if (bannerField.length) {
            bannerField.on('change', function() {
                const file = this.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        let preview = $('.banner-preview-img');
                        if (!preview.length) {
                            preview = $('<img class="banner-preview-img" style="max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 4px; margin-top: 10px;">');
                            bannerField.after(preview);
                        }
                        preview.attr('src', e.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Form validation
    function initFormValidation() {
        $('form').on('submit', function(e) {
            const title = $('#id_title').val().trim();
            const content = getContentValue();
            
            if (!title) {
                alert('Please enter a title for the blog post.');
                e.preventDefault();
                return false;
            }
            
            if (title.length < 5) {
                alert('Title must be at least 5 characters long.');
                e.preventDefault();
                return false;
            }
            
            if (!content || content.trim().length < 50) {
                alert('Content must be at least 50 characters long.');
                e.preventDefault();
                return false;
            }
            
            return true;
        });
    }

    // Keyboard shortcuts
    function initKeyboardShortcuts() {
        $(document).on('keydown', function(e) {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.keyCode === 83) {
                e.preventDefault();
                $('input[name="_save"]').click();
                return false;
            }
            
            // Ctrl+Shift+P or Cmd+Shift+P to preview
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 80) {
                e.preventDefault();
                $('.btn-preview').click();
                return false;
            }
        });
    }

    // Utility functions
    function getContentValue() {
        if (window.CKEDITOR && CKEDITOR.instances.id_content) {
            return CKEDITOR.instances.id_content.getData();
        }
        return $('textarea[name="content"]').val();
    }

    function showSavingIndicator() {
        let indicator = $('.auto-save-indicator');
        if (!indicator.length) {
            indicator = $('<div class="auto-save-indicator" style="position: fixed; top: 20px; right: 20px; background: #007cba; color: white; padding: 8px 12px; border-radius: 4px; z-index: 9999;">Saving...</div>');
            $('body').append(indicator);
        }
        indicator.show();
    }

    function showSaveSuccess() {
        $('.auto-save-indicator').text('Saved').delay(2000).fadeOut();
    }

    function showSaveError() {
        $('.auto-save-indicator').text('Save failed').css('background', '#dc3545').delay(3000).fadeOut();
    }

    // Slug generation
    function generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .trim();
    }

    // Auto-generate slug from title
    $('#id_title').on('input', function() {
        const slugField = $('#id_slug');
        if (!slugField.val() || slugField.data('auto-generated')) {
            const slug = generateSlug($(this).val());
            slugField.val(slug).data('auto-generated', true);
        }
    });

    // Mark slug as manually edited
    $('#id_slug').on('input', function() {
        $(this).data('auto-generated', false);
    });

})(django.jQuery);
