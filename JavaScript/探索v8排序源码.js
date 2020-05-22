// 先实现一个插入排序
function insertedSort(arr) {
    for (var i = 1; i < arr.length; i++) {
        var temp = arr[i];
        for (var j = i - 1; j >= 0; j--) {
            if (temp < arr[j]) {
                arr[j + 1] = arr[j];
            } else {
                break;
            }
        }
        arr[j + 1] = temp;
    }
    return arr;
}

// 快速排序
function quickSort(arr) {

    function getIndex(array, low, high) {
        let temp = array[low];
        while (low < high) {
            while (low < high && array[high] >= temp) high--;

            array[low] = array[high];

            while (low < high && array[low] <= temp) low++;

            array[high] = array[low];
        }
        array[low] = temp;
        return low;
    }

    function sort(array, low, high) {
        if (low >= high) return;

        let index = getIndex(array, low, high);
        sort(array, low, index - 1);
        sort(array, index + 1, high);
    }
    sort(arr, 0, arr.length - 1);
    return arr;
}