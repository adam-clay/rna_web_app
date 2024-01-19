from django.shortcuts import render, redirect
from .forms import DatasetForm


# Create your views here.

def parse_tsv(dataset):
    with dataset.file.open('r') as file:
        # Skip header
        next(file)
        
        data_dict = {}
        for line in file:
            key, value = line.strip().split('\t')
            data_dict[key] = int(value)
        
        dataset.data = data_dict
        dataset.save()

def upload_dataset(request): 
    if request.method == 'POST':
        form = DatasetForm(request.post, request.FILES)
        if form.is_valid():
            dataset = form.save()
            parse_tsv(dataset)
            return redirect('display_data')
    else:
        form = DatasetForm()
    return render(request, 'upload.html', {'form': form})
