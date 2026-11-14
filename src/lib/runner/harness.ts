/**
 * The Python side of the judge. The same source runs in the browser worker
 * (Pyodide) and in the Vitest reference-solution check, so a test that passes
 * locally passes identically on the phone.
 */
export const HARNESS = String.raw`
import json, sys, time, io, traceback

_PRELUDE = '''
from typing import *
from collections import Counter, defaultdict, deque, OrderedDict
import collections, heapq, bisect, math, itertools, functools, string, re

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
'''

def _to_list(ns, arr):
    head = None
    for v in reversed(arr or []):
        head = ns['ListNode'](v, head)
    return head

def _from_list(node):
    out, seen = [], 0
    while node is not None:
        out.append(node.val)
        node = node.next
        seen += 1
        if seen > 100000:
            raise RuntimeError('linked list has a cycle')
    return out

def _to_tree(ns, arr):
    if not arr or arr[0] is None:
        return None
    T = ns['TreeNode']
    root = T(arr[0])
    queue, i = [root], 1
    while queue and i < len(arr):
        node = queue.pop(0)
        if i < len(arr) and arr[i] is not None:
            node.left = T(arr[i]); queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = T(arr[i]); queue.append(node.right)
        i += 1
    return root

def _from_tree(root):
    out, queue = [], [root]
    while queue:
        node = queue.pop(0)
        if node is None:
            out.append(None)
        else:
            out.append(node.val); queue.append(node.left); queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out

def _conv_in(ns, value, kind):
    if kind == 'list': return _to_list(ns, value)
    if kind == 'tree': return _to_tree(ns, value)
    return value

def _conv_out(value, kind):
    if kind == 'list': return _from_list(value)
    if kind == 'tree': return _from_tree(value)
    return value

def _jsonable(o):
    if isinstance(o, (set, frozenset)): return sorted(o, key=repr)
    if isinstance(o, tuple): return list(o)
    if hasattr(o, 'items'): return dict(o)
    return repr(o)

def _trace(code):
    """Traceback limited to the user's own frames, with their source lines."""
    etype, err, tb = sys.exc_info()
    src = code.split('\n')
    lines = []
    for f in traceback.extract_tb(tb):
        if f.filename == 'solution.py':
            text = src[f.lineno - 1].strip() if 0 < f.lineno <= len(src) else ''
            lines.append('  line %d, in %s\n    %s' % (f.lineno, f.name, text))
    if isinstance(err, SyntaxError) and err.filename == 'solution.py':
        lines.append('  line %s\n    %s' % (err.lineno, (err.text or '').strip()))
    if isinstance(err, RecursionError):
        lines = lines[:2] + ['  ... (recursion repeats)']
    msg = traceback.format_exception_only(etype, err)[-1].strip()
    return '\n'.join(['Traceback (most recent call last):'] + lines + [msg])

def run_tests(payload):
    p = json.loads(payload)
    code = p['code']
    ns = {'__name__': 'solution'}
    exec(_PRELUDE, ns)
    try:
        exec(compile(code, 'solution.py', 'exec'), ns)
    except BaseException:
        return json.dumps({'fatal': _trace(code)})
    if 'Solution' not in ns:
        return json.dumps({'fatal': 'NameError: no class named Solution was defined'})
    if not hasattr(ns['Solution'], p['method']):
        return json.dumps({'fatal': "AttributeError: Solution has no method '%s'" % p['method']})
    results = []
    for args in p['tests']:
        res = {}
        buf, old = io.StringIO(), sys.stdout
        try:
            conv = [_conv_in(ns, a, k) for a, k in zip(args, p['kinds'])]
            sys.stdout = buf
            start = time.perf_counter()
            out = getattr(ns['Solution'](), p['method'])(*conv)
            res['ms'] = (time.perf_counter() - start) * 1000
            sys.stdout = old
            res['output'] = json.loads(json.dumps(_conv_out(out, p['returns']), default=_jsonable))
            res['ok'] = True
        except BaseException:
            sys.stdout = old
            res['ok'] = False
            res['error'] = _trace(code)
        res['stdout'] = buf.getvalue()[:4000]
        results.append(res)
    return json.dumps({'results': results})
`;
