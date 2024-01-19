from django.db import models

# Create your models here.
class Dataset(models.Model):
    name = models.CharField()
    file = models.FileField(upload_to='datasets/')
    data = models.JsonField(blank=True, null=True)

    def __str__(self):
        return self.name