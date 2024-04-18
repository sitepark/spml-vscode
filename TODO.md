# TODO

## In der Extension
- Bundling
- Build-Pipeline

## Offene Probleme
- Diagnostics
- Tabs?
  ```json
  {
    "backtrace": "   0: structured_logger::log_panic\n             at /home/schleuse/.cargo/registry/src/index.crates.io-6f17d22bba15001f/structured-logger-1.0.3/src/lib.rs:422:21\n   1: core::ops::function::Fn::call\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/ops/function.rs:79:5\n   2: <alloc::boxed::Box<F,A> as core::ops::function::Fn<Args>>::call\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/alloc/src/boxed.rs:2036:9\n   3: std::panicking::rust_panic_with_hook\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panicking.rs:792:13\n   4: std::panicking::begin_panic_handler::{{closure}}\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panicking.rs:657:13\n   5: std::sys_common::backtrace::__rust_end_short_backtrace\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/sys_common/backtrace.rs:171:18\n   6: rust_begin_unwind\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panicking.rs:645:5\n   7: core::panicking::panic_fmt\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/panicking.rs:72:14\n   8: core::str::slice_error_fail_rt\n   9: core::str::slice_error_fail\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/str/mod.rs:89:5\n  10: core::str::<impl str>::split_at\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/str/mod.rs:659:21\n  11: lspml::command::complete::CompletionCollector::complete_top_level_tags::{{closure}}\n             at /home/schleuse/develop/git/forks/lspml/src/command/complete.rs:155:22\n  12: core::option::Option<T>::map\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/option.rs:1072:29\n  13: lspml::command::complete::CompletionCollector::complete_top_level_tags\n             at /home/schleuse/develop/git/forks/lspml/src/command/complete.rs:150:20\n  14: lspml::command::complete::CompletionCollector::search_completions_in_document\n             at /home/schleuse/develop/git/forks/lspml/src/command/complete.rs:146:16\n  15: lspml::command::complete::CompletionCollector::search_completions_in_document\n             at /home/schleuse/develop/git/forks/lspml/src/command/complete.rs:131:28\n  16: lspml::command::complete::complete\n             at /home/schleuse/develop/git/forks/lspml/src/command/complete.rs:554:5\n  17: lspml::command::complete::{{closure}}\n             at /home/schleuse/develop/git/forks/lspml/src/command/mod.rs:69:37\n  18: core::result::Result<T,E>::map\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/result.rs:746:25\n  19: lspml::command::complete\n             at /home/schleuse/develop/git/forks/lspml/src/command/mod.rs:67:12\n  20: lspml::main_loop\n             at /home/schleuse/develop/git/forks/lspml/src/main.rs:184:50\n  21: lspml::main\n             at /home/schleuse/develop/git/forks/lspml/src/main.rs:164:5\n  22: core::ops::function::FnOnce::call_once\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/ops/function.rs:250:5\n  23: std::sys_common::backtrace::__rust_begin_short_backtrace\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/sys_common/backtrace.rs:155:18\n  24: std::rt::lang_start::{{closure}}\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/rt.rs:159:18\n  25: core::ops::function::impls::<impl core::ops::function::FnOnce<A> for &F>::call_once\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/ops/function.rs:284:13\n  26: std::panicking::try::do_call\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panicking.rs:552:40\n  27: std::panicking::try\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panicking.rs:516:19\n  28: std::panic::catch_unwind\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panic.rs:149:14\n  29: std::rt::lang_start_internal::{{closure}}\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/rt.rs:141:48\n  30: std::panicking::try::do_call\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panicking.rs:552:40\n  31: std::panicking::try\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panicking.rs:516:19\n  32: std::panic::catch_unwind\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/panic.rs:149:14\n  33: std::rt::lang_start_internal\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/rt.rs:141:20\n  34: std::rt::lang_start\n             at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/std/src/rt.rs:158:17\n  35: main\n  36: __libc_start_call_main\n             at ./csu/../sysdeps/nptl/libc_start_call_main.h:58:16\n  37: __libc_start_main_impl\n             at ./csu/../csu/libc-start.c:392:3\n  38: _start\n",
    "file": "/rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/str/mod.rs",
    "level": "ERROR",
    "line": 659,
    "message": "thread 'main' panicked at /rustc/becebb3158149a115cad8a402612e25436a7e37b/library/core/src/str/mod.rs:659:21:\nbyte index 7 is out of bounds of `\t<sp:`",
    "target": "panic",
    "thread_name": "main",
    "timestamp": 1713453028342
  }
  ```
  ```
  <%@ page language="java" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8"
  %><%@ taglib uri="http://www.sitepark.com/taglibs/core" prefix="sp"
  %><%@ taglib tagdir="/WEB-INF/tags/spt" prefix="spt"
  %><%@ taglib tagdir="/WEB-INF/tags/tag" prefix="tag"
  %>
  <sp:set name="_options" object="system.arguments.sectionType.options" />
  <sp:set name="_itemScope" object="system.arguments.itemScope" />

  <div class="editorblock">
    <sp:set name="_sectionType" scope="page" object="system.arguments.sectionType"/>
    <sp:set name="_options" scope="page" object="system.arguments.sectionType.options"/>
    <sp:set name="_categoryRoots" scope="page" object="__env.categoryRoots"/>

    <h2>Zuordnung zu einer Kategorie</h2>
    <div class="info">Hier haben Sie die Möglichkeit, die Seite unterschiedlichen Kategorien zuzuordnen. Wählen Sie dazu eine oder mehrere Kategorien aus.</div>
    <sp:include module="sitekit-module" uri="/templates/sectionTypes/views/categorization.spml">
      <sp:argument name="categoryRoots" object="_categoryRoots"/>
      <sp:argument name="itemScope" object="_itemScope"/>
      <sp:argument name="options" object="_options"/>
    </sp:include>

    <sp:include
  </div>
  ```

