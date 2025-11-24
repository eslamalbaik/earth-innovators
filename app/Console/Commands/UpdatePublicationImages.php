<?php

namespace App\Console\Commands;

use App\Models\Publication;
use Illuminate\Console\Command;

class UpdatePublicationImages extends Command
{
    protected $signature = 'publications:update-images';
    protected $description = 'Update all publications to use the default cover image';

    public function handle()
    {
        $imagePath = '/images/methods-of-generating-an-innovative-idea.png';
        $imageHtml = "<div style='text-align: center; margin: 20px 0;'>\n<img src='/images/methods-of-generating-an-innovative-idea.png' alt='طرق توليد فكرة مبتكرة' style='max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);' />\n</div>\n\n";
        $count = 0;
        $contentCount = 0;

        Publication::chunk(100, function ($publications) use ($imagePath, $imageHtml, &$count, &$contentCount) {
            foreach ($publications as $publication) {
                $updated = false;
                
                // تحديث cover_image
                if ($publication->cover_image !== $imagePath) {
                    $publication->cover_image = $imagePath;
                    $updated = true;
                    $count++;
                }
                
                // إضافة الصورة في المحتوى إذا لم تكن موجودة
                if ($publication->content && !str_contains($publication->content, 'methods-of-generating-an-innovative-idea.png')) {
                    // إضافة الصورة بعد العنوان الأول
                    if (preg_match('/<h1[^>]*>.*?<\/h1>/s', $publication->content, $matches)) {
                        $publication->content = str_replace($matches[0], $matches[0] . "\n\n" . $imageHtml, $publication->content);
                    } else {
                        // إذا لم يكن هناك h1، أضف الصورة في البداية
                        $publication->content = $imageHtml . $publication->content;
                    }
                    $updated = true;
                    $contentCount++;
                }
                
                if ($updated) {
                    $publication->save();
                }
            }
        });

        $this->info("تم تحديث {$count} مقال (cover_image) و {$contentCount} مقال (content) بنجاح!");
        return 0;
    }
}

