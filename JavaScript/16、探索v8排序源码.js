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
function quickSort1(arr) {

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


/** ============================================   v8 排序源码解析   ============================================= **/

/**
 * 简单的插入排序
 * @param a 要排序的数组
 * @param from 要排序的开始下标
 * @param to 要排序的结束下标
 * @constructor
 */
function InsertionSort(a, from, to) {
    for (var i = from + 1; i < to; i++) {
        var element = a[i];
        for (var j = i - 1; j >= from; j--) {
            var tmp = a[j];
            var order = comparefn(tmp, element);
            if (order > 0) {
                a[j + 1] = tmp;
            } else {
                break;
            }
        }
        a[j + 1] = element;
    }
}
// 在快速排序中，基准选择影响了排序的效率，如果每次都选择第一个作为基准，则排序时间复杂度可达O(n²)
// 最理想的情况下是每次都选择中间参数为基准，假设数组长度为n，时间复杂度为：o(nlog2n)
// v8基准选择原理：数组长度满足 10 < length < 1000 时，选择中间的元素arr[mid],头元素arr[form],尾元素arr[to]，三者排序后选择中间的作为基准
//              数组长度满足 length > 1000，每隔200-215个元素取一个值，排序后，选择中间的下标
function GetThirdIndex(a, from, to) {
    var t_array = new Array();

    // & 位运算符
    // 15转为二进制后为 0000 1111，任何数与15进行与运算后都只能得到小于等于15的数值
    var increment = 200 + ((to - from) & 15);

    var j = 0;
    from += 1;
    to -= 1;

    for (var i = from; i < to; i += increment) {
        t_array[j] = [i, a[i]];
        j++;
    }
    // 对随机挑选的这些值进行从小到大排序
    t_array.sort(function(a, b) {
        return comparefn(a[1], b[1]);
    });
    // 取中间值的下标
    // >> 1 运算相当于除以2
    var third_index = t_array[t_array.length >> 1][0];
    return third_index;
}
function QuickSort(a, from, to) {

    var third_index = 0;
    while (true) {
        // Insertion sort is faster for short arrays.
        // 对于数组长度在10以内的，使用插入排序
        if (to - from <= 10) {
            InsertionSort(a, from, to);
            return;
        }

        // 数组长度大于1000，调用 GetThirdIndex 取得中间值
        // 10 < 数组长度 <= 1000，取数组中间值下标为中间值
        if (to - from > 1000) {
            third_index = GetThirdIndex(a, from, to);
        } else {
            third_index = from + ((to - from) >> 1);
        }

        // Find a pivot as the median of first, last and middle element.
        // v0,v1,v2 保存头元素，中间元素，尾元素
        var v0 = a[from];
        var v1 = a[to - 1];
        var v2 = a[third_index];

        // 下面对 v0，v1，v2 进行从小到大排序，并且将 v0，v1，v2 重新赋值，得到最终结果 v0 <= v1 <= v2
        var c01 = comparefn(v0, v1);
        if (c01 > 0) {
            // v1 < v0, so swap them.
            var tmp = v0;
            v0 = v1;
            v1 = tmp;
        } // v0 <= v1.
        var c02 = comparefn(v0, v2);
        if (c02 >= 0) {
            // v2 <= v0 <= v1.
            var tmp = v0;
            v0 = v2;
            v2 = v1;
            v1 = tmp;
        } else {
            // v0 <= v1 && v0 < v2
            var c12 = comparefn(v1, v2);
            if (c12 > 0) {
                // v0 <= v2 < v1
                var tmp = v1;
                v1 = v2;
                v2 = tmp;
            }
        }

        // v0 <= v1 <= v2
        // 将 v0 的值赋值给头元素，v2 的值赋值给尾元素
        a[from] = v0;
        a[to - 1] = v2;
        // 基准的值为 v1
        var pivot = v1;

        // 快速排序的起始点为 from + 1 ，结束点为 to - 1
        var low_end = from + 1; // Upper bound of elements lower than pivot.
        var high_start = to - 1; // Lower bound of elements greater than pivot.

        a[third_index] = a[low_end];
        a[low_end] = pivot;

        // From low_end to i are elements equal to pivot.
        // From i to high_start are elements that haven't been compared yet.

        // 下面是快排的过程，将小于 pivot 的值放在 pivot 的左边，大于 pivot 的值放在 pivot 的右边
        partition: for (var i = low_end + 1; i < high_start; i++) {
            var element = a[i];
            var order = comparefn(element, pivot);
            if (order < 0) {
                a[i] = a[low_end];
                a[low_end] = element;
                low_end++;
            } else if (order > 0) {
                do {
                    high_start--;
                    if (high_start == i) break partition;
                    var top_elem = a[high_start];
                    order = comparefn(top_elem, pivot);
                } while (order > 0);

                a[i] = a[high_start];
                a[high_start] = element;
                if (order < 0) {
                    element = a[i];
                    a[i] = a[low_end];
                    a[low_end] = element;
                    low_end++;
                }
            }
        }


        if (to - high_start < low_end - from) {
            // 对基准后的数值进行排序，如果基准后的数值长度小于 10 ，就重新启动插入排序
            QuickSort(a, high_start, to);
            to = low_end;
        } else {
            // 对基准前的数值进行排序，如果基准前的数值长度小于 10 ，就重新启动插入排序
            QuickSort(a, from, low_end);
            from = high_start;
        }
    }
}
function comparefn(a, b) {
    return a - b
}

// var arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
// QuickSort(arr, 0, arr.length)
// console.log(arr)